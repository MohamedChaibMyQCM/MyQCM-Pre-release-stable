import { PartialType } from "@nestjs/mapped-types";
import { CreateRewardCategoryDto } from "./create-reward-category.dto";

export class UpdateRewardCategoryDto extends PartialType(
  CreateRewardCategoryDto,
) {}
