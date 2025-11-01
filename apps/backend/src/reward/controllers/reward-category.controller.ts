import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RewardCategoryService } from "../services/reward-category.service";
import { CreateRewardCategoryDto } from "../dto/create-reward-category.dto";
import { UpdateRewardCategoryDto } from "../dto/update-reward-category.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";

@ApiTags("Reward Categories")
@Controller("reward/categories")
@UseGuards(AccessTokenGuard, RolesGuard)
export class RewardCategoryController {
  constructor(private readonly categoryService: RewardCategoryService) {}

  @Get()
  @Roles(BaseRoles.USER, BaseRoles.ADMIN)
  async findAll() {
    const data = await this.categoryService.findAll();
    return {
      status: HttpStatus.OK,
      message: "Reward categories fetched successfully",
      data,
    };
  }

  @Post()
  @Roles(BaseRoles.ADMIN)
  async create(@Body() createDto: CreateRewardCategoryDto) {
    const data = await this.categoryService.create(createDto);
    return {
      status: HttpStatus.CREATED,
      message: "Reward category created successfully",
      data,
    };
  }

  @Patch(":categoryId")
  @Roles(BaseRoles.ADMIN)
  async update(
    @Param("categoryId", ParseUUIDPipe) categoryId: string,
    @Body() updateDto: UpdateRewardCategoryDto,
  ) {
    const data = await this.categoryService.update(categoryId, updateDto);
    return {
      status: HttpStatus.OK,
      message: "Reward category updated successfully",
      data,
    };
  }

  @Delete(":categoryId")
  @Roles(BaseRoles.ADMIN)
  async remove(@Param("categoryId", ParseUUIDPipe) categoryId: string) {
    const data = await this.categoryService.remove(categoryId);
    return {
      status: HttpStatus.OK,
      message: "Reward category deleted successfully",
      data,
    };
  }
}
