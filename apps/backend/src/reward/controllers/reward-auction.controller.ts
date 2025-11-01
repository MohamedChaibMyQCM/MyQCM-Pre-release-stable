import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RewardAuctionService } from "../services/reward-auction.service";
import { CreateRewardAuctionDto } from "../dto/create-reward-auction.dto";
import { UpdateRewardAuctionDto } from "../dto/update-reward-auction.dto";
import { PlaceBidDto } from "../dto/place-bid.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { RewardAuctionStatus } from "../enums/reward-auction-status.enum";

@ApiTags("Reward Auctions")
@Controller("reward/auctions")
@UseGuards(AccessTokenGuard, RolesGuard)
export class RewardAuctionController {
  constructor(private readonly auctionService: RewardAuctionService) {}

  @Get()
  @Roles(BaseRoles.USER, BaseRoles.ADMIN)
  async findAll(
    @Query("status") status?: RewardAuctionStatus | RewardAuctionStatus[],
    @Query("activeOnly") activeOnly?: string,
  ) {
    const statuses = Array.isArray(status)
      ? status
      : status
      ? (status as string).split(",")
      : undefined;

    const data = await this.auctionService.findAll({
      status: statuses as RewardAuctionStatus[] | undefined,
      activeOnly: activeOnly === "true",
    });

    return {
      status: HttpStatus.OK,
      message: "Reward auctions fetched successfully",
      data,
    };
  }

  @Get(":auctionId")
  @Roles(BaseRoles.USER, BaseRoles.ADMIN)
  async findOne(@Param("auctionId", ParseUUIDPipe) auctionId: string) {
    const data = await this.auctionService.findOne(auctionId);
    return {
      status: HttpStatus.OK,
      message: "Reward auction fetched successfully",
      data,
    };
  }

  @Post()
  @Roles(BaseRoles.ADMIN)
  async create(
    @GetUser() user: JwtPayload,
    @Body() createDto: CreateRewardAuctionDto,
  ) {
    const data = await this.auctionService.create(createDto, user.id);
    return {
      status: HttpStatus.CREATED,
      message: "Reward auction created successfully",
      data,
    };
  }

  @Patch(":auctionId")
  @Roles(BaseRoles.ADMIN)
  async update(
    @Param("auctionId", ParseUUIDPipe) auctionId: string,
    @Body() updateDto: UpdateRewardAuctionDto,
  ) {
    const data = await this.auctionService.update(auctionId, updateDto);
    return {
      status: HttpStatus.OK,
      message: "Reward auction updated successfully",
      data,
    };
  }

  @Post(":auctionId/bids")
  @Roles(BaseRoles.USER)
  async placeBid(
    @Param("auctionId", ParseUUIDPipe) auctionId: string,
    @GetUser() user: JwtPayload,
    @Body() bidDto: PlaceBidDto,
  ) {
    const data = await this.auctionService.placeBid(auctionId, user.id, bidDto);
    return {
      status: HttpStatus.OK,
      message: "Bid placed successfully",
      data,
    };
  }
}
