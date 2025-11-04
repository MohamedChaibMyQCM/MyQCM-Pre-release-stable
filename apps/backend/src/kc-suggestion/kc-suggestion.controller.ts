import {
  Body,
  Controller,
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
import { SuggestKcRequestDto } from "./dto/suggest-kc.dto";
import { KcSuggestionService } from "./services/kc-suggestion.service";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { User } from "src/user/entities/user.entity";

@ApiTags("Knowledge Components")
@ApiBearerAuth()
@Controller("courses")
export class KcSuggestionController {
  constructor(private readonly suggestionService: KcSuggestionService) {}

  @Post(":courseId/kc-suggestions")
  @ApiOperation({
    summary: "Suggest knowledge components for MCQ items",
    description:
      "Generates AI-based knowledge component suggestions for supplied MCQ payloads.",
  })
  @ApiBody({ type: SuggestKcRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Suggestions generated successfully",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN, BaseRoles.FREELANCER)
  async suggestForCourse(
    @Param("courseId", new ParseUUIDPipe()) courseId: string,
    @Body() dto: SuggestKcRequestDto,
    @GetUser() user: User,
  ) {
    const displayName = user?.name || user?.email || undefined;

    const result = await this.suggestionService.handleSuggestRequest(
      courseId,
      dto,
      user
        ? { id: user.id, email: user.email, name: displayName }
        : undefined,
    );

    const firstItem = result.items[0];
    return {
      suggested: firstItem?.suggestions ?? [],
      rationale: firstItem?.rationale ?? null,
      confidence: firstItem?.confidence ?? "low",
      confidence_score: firstItem?.confidenceScore ?? 0,
      items: result.items,
      model: result.model,
      prompt_version: result.promptVersion,
      request_id: result.requestId,
    };
  }
}
