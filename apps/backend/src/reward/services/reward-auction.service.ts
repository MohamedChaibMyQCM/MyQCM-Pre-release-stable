import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { RewardAuction } from "../entities/reward-auction.entity";
import { CreateRewardAuctionDto } from "../dto/create-reward-auction.dto";
import { UpdateRewardAuctionDto } from "../dto/update-reward-auction.dto";
import { RewardAuctionStatus } from "../enums/reward-auction-status.enum";
import { RewardAuctionBid } from "../entities/reward-auction-bid.entity";
import { PlaceBidDto } from "../dto/place-bid.dto";
import { UserXpService } from "src/user/services/user-xp.service";
import { RewardAuctionBidStatus } from "../enums/reward-auction-bid-status.enum";
import { RewardTransaction } from "../entities/reward-transaction.entity";
import { RewardTransactionType } from "../enums/reward-transaction-type.enum";
import { RewardTransactionStatus } from "../enums/reward-transaction-status.enum";

@Injectable()
export class RewardAuctionService {
  constructor(
    @InjectRepository(RewardAuction)
    private readonly auctionRepository: Repository<RewardAuction>,
    private readonly dataSource: DataSource,
    private readonly userXpService: UserXpService,
  ) {}

  async create(createDto: CreateRewardAuctionDto, createdByAdminId?: string) {
    const status =
      createDto.status ??
      (createDto.startsAt
        ? RewardAuctionStatus.SCHEDULED
        : RewardAuctionStatus.DRAFT);

    const auction = this.auctionRepository.create({
      ...createDto,
      startsAt: createDto.startsAt ? new Date(createDto.startsAt) : undefined,
      endsAt: createDto.endsAt ? new Date(createDto.endsAt) : undefined,
      minimumIncrement: createDto.minimumIncrement ?? 10,
      status,
      createdBy: createdByAdminId ? ({ id: createdByAdminId } as any) : null,
    });

    return this.auctionRepository.save(auction);
  }

  async findAll(options?: { status?: RewardAuctionStatus[]; activeOnly?: boolean }) {
    const qb = this.auctionRepository
      .createQueryBuilder("auction")
      .leftJoinAndSelect("auction.winningBid", "winningBid")
      .orderBy("auction.createdAt", "DESC");

    if (options?.status?.length) {
      qb.andWhere("auction.status IN (:...status)", { status: options.status });
    }

    if (options?.activeOnly) {
      qb.andWhere("auction.status IN (:...activeStatuses)", {
        activeStatuses: [RewardAuctionStatus.ACTIVE, RewardAuctionStatus.SCHEDULED],
      });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const auction = await this.auctionRepository.findOne({
      where: { id },
      relations: ["winningBid", "bids", "bids.bidder"],
    });
    if (!auction) {
      throw new NotFoundException("Reward auction not found");
    }
    return auction;
  }

  async update(id: string, updateDto: UpdateRewardAuctionDto) {
    const auction = await this.findOne(id);

    if (updateDto.startsAt !== undefined) {
      auction.startsAt = updateDto.startsAt
        ? new Date(updateDto.startsAt)
        : undefined;
    }

    if (updateDto.endsAt !== undefined) {
      auction.endsAt = updateDto.endsAt ? new Date(updateDto.endsAt) : undefined;
    }

    if (updateDto.minimumIncrement !== undefined) {
      auction.minimumIncrement = updateDto.minimumIncrement;
    }

    const { startsAt, endsAt, minimumIncrement, ...rest } = updateDto;
    Object.assign(auction, rest);

    return this.auctionRepository.save(auction);
  }

  async placeBid(auctionId: string, bidderId: string, bidDto: PlaceBidDto) {
    const bidAmount = bidDto.amount;

    if (bidAmount <= 0) {
      throw new BadRequestException("Bid amount must be positive");
    }

    return this.dataSource.transaction(async (manager) => {
      const auction = await manager.findOne(RewardAuction, {
        where: { id: auctionId },
        lock: { mode: "pessimistic_write" },
        relations: ["winningBid", "winningBid.transaction"],
      });

      if (!auction) {
        throw new NotFoundException("Reward auction not found");
      }

      const now = new Date();
      if (auction.endsAt && auction.endsAt <= now) {
        throw new BadRequestException("Auction has already ended");
      }

      if (auction.status === RewardAuctionStatus.CANCELLED || auction.status === RewardAuctionStatus.COMPLETED) {
        throw new BadRequestException("Auction is not accepting bids");
      }

      if (
        auction.status === RewardAuctionStatus.SCHEDULED &&
        auction.startsAt &&
        auction.startsAt <= now
      ) {
        auction.status = RewardAuctionStatus.ACTIVE;
      }

      if (auction.status !== RewardAuctionStatus.ACTIVE) {
        throw new BadRequestException("Auction is not active yet");
      }

      const minimumRequired = auction.currentBidAmount
        ? auction.currentBidAmount + auction.minimumIncrement
        : auction.startingBid;

      if (bidAmount < minimumRequired) {
        throw new BadRequestException(`Bid must be at least ${minimumRequired} XP`);
      }

      const userXp = await this.userXpService.getUserXP(bidderId, manager);
      if (userXp.xp < bidAmount) {
        throw new BadRequestException("Insufficient XP balance for this bid");
      }

      const previousWinningBid = auction.winningBid
        ? await manager.findOne(RewardAuctionBid, {
            where: { id: auction.winningBid.id },
            relations: ["transaction"],
            lock: { mode: "pessimistic_write" },
          })
        : null;

      if (previousWinningBid) {
        previousWinningBid.status = RewardAuctionBidStatus.OUTBID;
        previousWinningBid.isWinning = false;
        await manager.save(previousWinningBid);

        if (previousWinningBid.transaction) {
          previousWinningBid.transaction.status = RewardTransactionStatus.CANCELLED;
          await manager.save(previousWinningBid.transaction);
        }
      }

      const bid = manager.create(RewardAuctionBid, {
        auction: { id: auction.id },
        bidder: { id: bidderId } as any,
        amount: bidAmount,
        status: RewardAuctionBidStatus.WINNING,
        isWinning: true,
      });

      const transaction = manager.create(RewardTransaction, {
        user: { id: bidderId } as any,
        auction: { id: auction.id },
        amount: bidAmount,
        type: RewardTransactionType.HOLD,
        status: RewardTransactionStatus.PENDING,
        description: `Bid placed on auction ${auction.title}`,
      });

      await manager.save(transaction);

      bid.transaction = transaction;
      await manager.save(bid);

      auction.currentBidAmount = bidAmount;
      auction.currentLeaderId = bidderId;
      auction.winningBid = bid;
      await manager.save(auction);

      return {
        auction,
        bid,
      };
    });
  }
}
