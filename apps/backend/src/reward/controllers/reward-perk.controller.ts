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
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RewardPerkService } from "../services/reward-perk.service";
import { CreateRewardPerkDto } from "../dto/create-reward-perk.dto";
import { UpdateRewardPerkDto } from "../dto/update-reward-perk.dto";
import { PurchaseRewardPerkDto } from "../dto/purchase-reward-perk.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";

@ApiTags("Reward Perks")
@Controller("reward/perks")
@UseGuards(AccessTokenGuard, RolesGuard)
export class RewardPerkController {
  constructor(private readonly perkService: RewardPerkService) {}

  @Get()
  @Roles(BaseRoles.USER, BaseRoles.ADMIN)
  async findAll(
    @GetUser() user: JwtPayload,
    @Query("categoryId") categoryId?: string,
    @Query("includeInactive") includeInactive?: string,
  ) {
    const shouldIncludeInactive =
      includeInactive === "true" && user.role === BaseRoles.ADMIN;

    const data = await this.perkService.findAll({
      includeInactive: shouldIncludeInactive,
      categoryId,
    });

    return {
      status: HttpStatus.OK,
      message: "Reward perks fetched successfully",
      data,
    };
  }

  @Post()
  @Roles(BaseRoles.ADMIN)
  async create(@Body() createDto: CreateRewardPerkDto) {
    const data = await this.perkService.create(createDto);
    return {
      status: HttpStatus.CREATED,
      message: "Reward perk created successfully",
      data,
    };
  }

  @Patch(":perkId")
  @Roles(BaseRoles.ADMIN)
  async update(
    @Param("perkId", ParseUUIDPipe) perkId: string,
    @Body() updateDto: UpdateRewardPerkDto,
  ) {
    const data = await this.perkService.update(perkId, updateDto);
    return {
      status: HttpStatus.OK,
      message: "Reward perk updated successfully",
      data,
    };
  }

  @Delete(":perkId")
  @Roles(BaseRoles.ADMIN)
  async remove(@Param("perkId", ParseUUIDPipe) perkId: string) {
    const data = await this.perkService.remove(perkId);
    return {
      status: HttpStatus.OK,
      message: "Reward perk deleted successfully",
      data,
    };
  }

  @Post(":perkId/redeem")
  @Roles(BaseRoles.USER)
  async redeem(
    @Param("perkId", ParseUUIDPipe) perkId: string,
    @GetUser() user: JwtPayload,
    @Body() purchaseDto: PurchaseRewardPerkDto,
  ) {
    const data = await this.perkService.redeem(perkId, user.id, purchaseDto);
    return {
      status: HttpStatus.OK,
      message: "Reward perk redeemed successfully",
      data,
    };
  }
}
