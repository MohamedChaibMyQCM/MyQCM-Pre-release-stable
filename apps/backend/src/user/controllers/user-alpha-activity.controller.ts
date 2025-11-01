import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { UserAlphaActivityService } from "../services/user-alpha-activity.service";
import { StartAlphaSessionDto } from "../types/dtos/start-alpha-session.dto";
import { CompleteAlphaSessionDto } from "../types/dtos/complete-alpha-session.dto";

@Controller("user/alpha-activity")
@UseGuards(AccessTokenGuard)
export class UserAlphaActivityController {
  constructor(
    private readonly alphaActivityService: UserAlphaActivityService,
  ) {}

  /**
   * Get alpha XP configuration
   * GET /user/alpha-activity/xp-config
   */
  @Get("xp-config")
  async getXpConfig() {
    const config =
      await this.alphaActivityService.getAlphaXpConfigForDisplay();
    return {
      success: true,
      data: config,
    };
  }

  /**
   * Start a new alpha feature session
   * POST /user/alpha-activity/start
   */
  @Post("start")
  @HttpCode(HttpStatus.CREATED)
  async startSession(
    @GetUser() user: JwtPayload,
    @Body() dto: StartAlphaSessionDto,
  ) {
    const activity = await this.alphaActivityService.startAlphaSession(
      user.id,
      dto.feature_id,
      dto.feature_name,
    );

    return {
      success: true,
      message: "Alpha session started",
      data: {
        activity_id: activity.id,
        started_at: activity.started_at,
      },
    };
  }

  /**
   * Complete alpha session and award XP
   * POST /user/alpha-activity/complete
   */
  @Post("complete")
  @HttpCode(HttpStatus.OK)
  async completeSession(
    @GetUser() user: JwtPayload,
    @Body() dto: CompleteAlphaSessionDto,
  ) {
    const result = await this.alphaActivityService.completeAlphaSession(
      dto.activity_id,
      user.id,
      dto.rating,
      dto.feedback_text || "",
    );

    return {
      success: true,
      message: "Alpha session completed and XP awarded",
      data: {
        total_xp_earned: result.xpCalculation.totalXp,
        breakdown: result.xpCalculation.breakdown,
        testing_xp: result.xpCalculation.testingXp,
        time_spent_xp: result.xpCalculation.timeSpentXp,
        feedback_quality_xp: result.xpCalculation.feedbackQualityXp,
        time_spent_minutes: Math.floor(
          result.activity.time_spent_seconds / 60,
        ),
      },
    };
  }

  /**
   * Get user's alpha activities history
   * GET /user/alpha-activity/history
   */
  @Get("history")
  async getHistory(
    @GetUser() user: JwtPayload,
    @Query("feature_id") featureId?: string,
  ) {
    const activities = await this.alphaActivityService.getUserAlphaActivities(
      user.id,
      featureId,
    );

    return {
      success: true,
      data: activities,
    };
  }

  /**
   * Check if user has completed a specific feature
   * GET /user/alpha-activity/check-completion
   */
  @Get("check-completion")
  async checkCompletion(
    @GetUser() user: JwtPayload,
    @Query("feature_id") featureId: string,
  ) {
    const hasCompleted = await this.alphaActivityService.hasCompletedFeature(
      user.id,
      featureId,
    );

    return {
      success: true,
      data: {
        has_completed: hasCompleted,
      },
    };
  }
}
