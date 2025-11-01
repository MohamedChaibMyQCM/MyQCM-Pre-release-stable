import { PartialType } from "@nestjs/mapped-types";
import { CreateRewardAuctionDto } from "./create-reward-auction.dto";

export class UpdateRewardAuctionDto extends PartialType(
  CreateRewardAuctionDto,
) {}
