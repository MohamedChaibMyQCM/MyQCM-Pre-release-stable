import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { User } from "src/user/entities/user.entity";
import { KnowledgeComponentAiService } from "./knowledge-component-ai.service";
import {
  KnowledgeComponentAiApplyRequestDto,
  KnowledgeComponentAiReviewRequestDto,
} from "./dto/ai-match.dto";

@ApiTags("Knowledge Components")
@ApiBearerAuth()
@Controller("knowledge-components")
export class KnowledgeComponentAiController {
  constructor(private readonly aiService: KnowledgeComponentAiService) {}

  @Post("courses/:courseId/ai-review")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN, BaseRoles.FREELANCER)
  @ApiOperation({
    summary: "Run AI review for MCQs in a course",
    description:
      "Generates suggested knowledge components across MCQs already associated with the course.",
  })
  @ApiBody({ type: KnowledgeComponentAiReviewRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "AI suggestions returned",
  })
  async reviewCourse(
    @Param("courseId", ParseUUIDPipe) courseId: string,
    @Body() dto: KnowledgeComponentAiReviewRequestDto,
    @GetUser() user: User,
  ) {
    const userInfo = user
      ? { id: user.id, email: user.email, name: user.name }
      : undefined;

    const result = await this.aiService.reviewCourse(courseId, dto, userInfo);

    return {
      message: "AI review generated knowledge component suggestions.",
      status: HttpStatus.OK,
      data: result,
    };
  }

  @Post("courses/:courseId/ai-apply")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN, BaseRoles.FREELANCER)
  @ApiOperation({
    summary: "Publish AI reviewed knowledge components",
    description:
      "Links the selected knowledge components to the MCQs and pushes them to production.",
  })
  @ApiBody({ type: KnowledgeComponentAiApplyRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "MCQs updated with AI-reviewed knowledge components",
  })
  async applyMatches(
    @Param("courseId", ParseUUIDPipe) courseId: string,
    @Body() dto: KnowledgeComponentAiApplyRequestDto,
  ) {
    const result = await this.aiService.applyMatches(courseId, dto);
    return {
      message: `${result.applied} MCQ(s) pushed to production`,
      status: HttpStatus.OK,
      data: result,
    };
  }

  @Get("courses/:courseId/ai-suggestions")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN, BaseRoles.FREELANCER)
  @ApiOperation({
    summary: "List stored AI knowledge component suggestions",
    description:
      "Returns MCQs within the course that have pending AI-generated knowledge component suggestions.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Stored suggestions retrieved",
  })
  async listSuggestions(
    @Param("courseId", ParseUUIDPipe) courseId: string,
  ) {
    const data = await this.aiService.listStoredSuggestions(courseId);
    return {
      message: "Retrieved stored AI suggestions.",
      status: HttpStatus.OK,
      data,
    };
  }
}
