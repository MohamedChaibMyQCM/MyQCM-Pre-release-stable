import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from "@nestjs/common";
import { FeatureAnnouncementService } from "./feature-announcement.service";
import { CreateFeatureAnnouncementDto } from "./dto/create-feature-announcement.dto";
import { UpdateFeatureAnnouncementDto } from "./dto/update-feature-announcement.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/auth/roles.guard";
import { Roles } from "../../common/decorators/auth/roles.decorator";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { User } from "src/user/entities/user.entity";
import { BaseRoles } from "../../shared/enums/base-roles.enum";

@Controller("feature-announcements")
export class FeatureAnnouncementController {
  constructor(
    private readonly featureAnnouncementService: FeatureAnnouncementService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  create(
    @Body() createDto: CreateFeatureAnnouncementDto,
    @CurrentUser() user: any
  ) {
    return this.featureAnnouncementService.create(createDto, user?.id);
  }

  @Get()
  findAll() {
    return this.featureAnnouncementService.findAll();
  }

  @Get("new")
  @UseGuards(JwtAuthGuard)
  async getNewFeatures(@CurrentUser() user: User) {
    return await this.featureAnnouncementService.getNewFeatures(
      user.id,
      user.role as string
    );
  }

  @Get("changelog")
  async getChangelog(
    @Query("filter") filter?: string,
    @Query("limit") limit?: number
  ) {
    return await this.featureAnnouncementService.getChangelog(
      filter,
      limit ? parseInt(limit as any) : 20
    );
  }

  @Get("analytics")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async getAnalytics() {
    return await this.featureAnnouncementService.getAnalytics();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.featureAnnouncementService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  update(@Param("id") id: string, @Body() updateDto: UpdateFeatureAnnouncementDto) {
    return this.featureAnnouncementService.update(id, updateDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  remove(@Param("id") id: string) {
    return this.featureAnnouncementService.remove(id);
  }

  @Post(":id/seen")
  @UseGuards(JwtAuthGuard)
  async markAsSeen(@Param("id") id: string, @CurrentUser() user: User) {
    await this.featureAnnouncementService.recordInteraction(
      id,
      user.id,
      "seen"
    );
    return { success: true };
  }

  @Post(":id/tried")
  @UseGuards(JwtAuthGuard)
  async markAsTried(@Param("id") id: string, @CurrentUser() user: User) {
    await this.featureAnnouncementService.recordInteraction(
      id,
      user.id,
      "tried"
    );
    return { success: true };
  }

  @Post(":id/dismissed")
  @UseGuards(JwtAuthGuard)
  async markAsDismissed(@Param("id") id: string, @CurrentUser() user: User) {
    await this.featureAnnouncementService.recordInteraction(
      id,
      user.id,
      "dismissed"
    );
    return { success: true };
  }
}
