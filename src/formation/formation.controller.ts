import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { FormationService } from "./formation.service";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { CreateFormationDto } from "./dto/create-formation.dto";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { Roles } from "common/decorators/auth/roles.decorator";

@Controller("formation")
export class FormationController {
  constructor(private readonly formationService: FormationService) {}

  @Post()
  create(@Body() createFormationDto: CreateFormationDto) {
    return this.formationService.create(createFormationDto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  @Get()
  findAll() {
    return this.formationService.findAll();
  }

  @Get(":emailId")
  findOne(@Param("id") id: string) {
    return this.formationService.findOne(id);
  }
}
