import { PartialType } from "@nestjs/mapped-types";
import { CreateRewardPerkDto } from "./create-reward-perk.dto";

export class UpdateRewardPerkDto extends PartialType(CreateRewardPerkDto) {}
