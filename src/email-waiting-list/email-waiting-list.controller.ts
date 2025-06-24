import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { EmailWaitingListService } from "./email-waiting-list.service";
import { CreateEmailWaitingListDto } from "./dto/create-email-waiting-list.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("email waiting list")
@Controller("email-waiting-list")
export class EmailWaitingListController {
  constructor(
    private readonly emailWaitingListService: EmailWaitingListService,
  ) {}

  @ApiOperation({
    summary: "add new email to waiting list",
  })
  @Post()
  create(@Body() createEmailWaitingListDto: CreateEmailWaitingListDto) {
    return this.emailWaitingListService.create(createEmailWaitingListDto);
  }

  @ApiOperation({
    summary: "get all emails from waiting list (admin only)",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  @Get()
  findAll() {
    return this.emailWaitingListService.findAll();
  }

  @ApiOperation({
    summary: "get email by id (admin only)",
  })
  @Get(":emailId")
  findOne(@Param("id") id: string) {
    return this.emailWaitingListService.findOne(id);
  }
}
