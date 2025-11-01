import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { RewardPerk } from "../entities/reward-perk.entity";
import { CreateRewardPerkDto } from "../dto/create-reward-perk.dto";
import { UpdateRewardPerkDto } from "../dto/update-reward-perk.dto";
import { RewardCategory } from "../entities/reward-category.entity";
import { PurchaseRewardPerkDto } from "../dto/purchase-reward-perk.dto";
import { RewardTransactionType } from "../enums/reward-transaction-type.enum";
import { RewardTransactionStatus } from "../enums/reward-transaction-status.enum";
import { UserXpService } from "src/user/services/user-xp.service";
import { UserSubscriptionService } from "src/user/services/user-subscription.service";
import { RewardTransaction } from "../entities/reward-transaction.entity";

@Injectable()
export class RewardPerkService {
  constructor(
    @InjectRepository(RewardPerk)
    private readonly perkRepository: Repository<RewardPerk>,
    @InjectRepository(RewardCategory)
    private readonly categoryRepository: Repository<RewardCategory>,
    private readonly dataSource: DataSource,
    private readonly userXpService: UserXpService,
    private readonly userSubscriptionService: UserSubscriptionService,
  ) {}

  async create(createDto: CreateRewardPerkDto) {
    const category = await this.categoryRepository.findOne({
      where: { id: createDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException("Reward category not found");
    }
    const perk = this.perkRepository.create({
      ...createDto,
      category,
    });
    return this.perkRepository.save(perk);
  }

  async findAll(options?: { includeInactive?: boolean; categoryId?: string }) {
    const qb = this.perkRepository
      .createQueryBuilder("perk")
      .leftJoinAndSelect("perk.category", "category");

    if (!options?.includeInactive) {
      qb.andWhere("perk.isActive = :active", { active: true });
      qb.andWhere("category.isActive = :categoryActive", {
        categoryActive: true,
      });
    }

    if (options?.categoryId) {
      qb.andWhere("category.id = :categoryId", {
        categoryId: options.categoryId,
      });
    }

    qb.orderBy("category.sortOrder", "ASC")
      .addOrderBy("category.name", "ASC")
      .addOrderBy("perk.xpCost", "ASC");

    return qb.getMany();
  }

  async findOne(id: string) {
    const perk = await this.perkRepository.findOne({
      where: { id },
      relations: ["category"],
    });
    if (!perk) {
      throw new NotFoundException("Reward perk not found");
    }
    return perk;
  }

  async update(id: string, updateDto: UpdateRewardPerkDto) {
    const perk = await this.findOne(id);

    if (updateDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException("Reward category not found");
      }
      perk.category = category;
    }

    const { categoryId, ...rest } = updateDto;
    Object.assign(perk, rest);

    return this.perkRepository.save(perk);
  }

  async remove(id: string) {
    const perk = await this.findOne(id);
    await this.perkRepository.remove(perk);
    return { deleted: true };
  }

  async redeem(perkId: string, userId: string, redeemDto: PurchaseRewardPerkDto) {
    const quantity = redeemDto.quantity ?? 1;

    if (quantity <= 0) {
      throw new BadRequestException("Quantity must be greater than zero");
    }

    return this.dataSource.transaction(async (manager) => {
      const perk = await manager.findOne(RewardPerk, {
        where: { id: perkId },
        lock: { mode: "pessimistic_write" },
      });

      if (!perk || !perk.isActive) {
        throw new NotFoundException("Reward perk not available");
      }

      if (perk.stock !== null && perk.stock !== undefined) {
        if (perk.stock < quantity) {
          throw new BadRequestException("Perk stock is insufficient");
        }
        perk.stock -= quantity;
      }

      if (
        perk.maxRedemptions !== null &&
        perk.maxRedemptions !== undefined &&
        perk.redeemedCount + quantity > perk.maxRedemptions
      ) {
        throw new BadRequestException(
          "Perk redemption limit reached for this reward",
        );
      }

      const totalCost = perk.xpCost * quantity;

      const userXp = await this.userXpService.getUserXP(userId, manager);
      if (userXp.xp < totalCost) {
        throw new BadRequestException("Insufficient XP balance");
      }

      await this.userXpService.decrementUserXP(userId, totalCost, manager);

      perk.redeemedCount += quantity;
      await manager.save(perk);

      const metadata: Record<string, unknown> = {
        quantity,
        notes: redeemDto.notes,
      };

      const credits = this.extractCredits(perk, quantity);
      if (credits) {
        await this.userSubscriptionService.addUsageCredits(
          userId,
          credits,
          manager,
        );
        metadata.creditsApplied = credits;
      }

      const transaction = manager.create(RewardTransaction, {
        user: { id: userId },
        perk: { id: perk.id },
        amount: totalCost,
        type: RewardTransactionType.DEBIT,
        status: RewardTransactionStatus.COMPLETED,
        description: `Redeemed perk ${perk.title}`,
        metadata,
      });

      await manager.save(transaction);

      return {
        perk,
        transaction,
      };
    });
  }

  private extractCredits(
    perk: RewardPerk,
    quantity: number,
  ): { mcqs?: number; qrocs?: number } | null {
    const normalized = {
      mcqs: Math.max(0, Math.floor(perk.creditMcqs ?? 0)),
      qrocs: Math.max(0, Math.floor(perk.creditQrocs ?? 0)),
    };

    if (normalized.mcqs === 0 && normalized.qrocs === 0) {
      const metadata = perk.metadata;
      if (!metadata || typeof metadata !== "object") {
        return null;
      }

      const credits = (metadata as Record<string, unknown>).credits;
      if (!credits || typeof credits !== "object") {
        return null;
      }

      normalized.mcqs = Math.max(
        0,
        Math.floor(Number((credits as Record<string, unknown>).mcqs ?? 0)),
      );
      normalized.qrocs = Math.max(
        0,
        Math.floor(Number((credits as Record<string, unknown>).qrocs ?? 0)),
      );
    }

    if (normalized.mcqs === 0 && normalized.qrocs === 0) {
      return null;
    }

    const multiplier = Math.max(quantity, 1);
    return {
      ...(normalized.mcqs > 0 ? { mcqs: normalized.mcqs * multiplier } : {}),
      ...(normalized.qrocs > 0 ? { qrocs: normalized.qrocs * multiplier } : {}),
    };
  }
}
