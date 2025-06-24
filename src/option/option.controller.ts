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
import { OptionService } from "./option.service";
import { CreateOptionDto } from "./dto/create-option.dto";
import { UpdateOptionDto } from "./dto/update-option.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { ApiOperation } from "@nestjs/swagger";

@Controller("option")
export class OptionController {
  constructor(private readonly optionService: OptionService) {}

  @Patch(":optionId")
  @ApiOperation({
    summary: "update qcm option by option id",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  update(
    @Param("optionId") optionId: string,
    @Body() updateOptionDto: UpdateOptionDto,
  ) {
    return this.optionService.update(optionId, updateOptionDto);
  }

  @Delete(":optionId")
  @ApiOperation({
    summary: "delete qcm option by option id",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  remove(@Param("optionId") optionId: string) {
    return this.optionService.remove(optionId);
  }
}
