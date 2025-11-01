import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";
import { RewardAuctionStatus } from "../enums/reward-auction-status.enum";
import { Type } from "class-transformer";

export class CreateRewardAuctionDto {
  @IsString()
  @MaxLength(180)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  partner?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  startingBid: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  minimumIncrement?: number;

  @IsOptional()
  @IsEnum(RewardAuctionStatus)
  status?: RewardAuctionStatus;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
