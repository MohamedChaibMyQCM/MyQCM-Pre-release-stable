import {
  BadRequestException,
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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { createReadStream, existsSync } from "fs";
import { join } from "path";
import { KnowledgeComponentService } from "./knowledge-component.service";
import { CreateKnowledgeComponentDto } from "./dto/create-knowledge-component.dto";
import { UpdateKnowledgeComponentDto } from "./dto/update-knowledge-component.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";

@Controller("knowledge-components")
export class KnowledgeComponentController {
  constructor(
    private readonly knowledgeComponentService: KnowledgeComponentService,
  ) {}

  @Get()
  async listComponents(
    @Query("domainId") domainId?: string,
    @Query("courseId") courseId?: string,
    @Query("includeInactive") includeInactive?: string,
    @Query("includeRelations") includeRelations?: string,
  ) {
    return this.knowledgeComponentService.listComponents({
      domainId,
      courseId,
      includeInactive: includeInactive === "true",
      includeRelations: includeRelations === "true",
    });
  }

  @Get("domains")
  async listDomains(
    @Query("includeInactive") includeInactive?: string,
    @Query("includeComponents") includeComponents?: string,
  ) {
    return this.knowledgeComponentService.listDomains({
      includeInactive: includeInactive === "true",
      includeComponents: includeComponents === "true",
    });
  }

  @Get("template")
  async downloadTemplate(@Res() res: Response) {
    const candidatePaths = [
      join(
        process.cwd(),
        "seed",
        "knowledge-components.template.csv",
      ),
      join(
        process.cwd(),
        "apps",
        "backend",
        "seed",
        "knowledge-components.template.csv",
      ),
      join(
        __dirname,
        "..",
        "seed",
        "knowledge-components.template.csv",
      ),
    ];

    const templatePath = candidatePaths.find((path) => existsSync(path));

    if (!templatePath) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "Knowledge component template not found" });
      return;
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="knowledge-components.template.csv"',
    );

    return createReadStream(templatePath).pipe(res);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN, BaseRoles.FREELANCER)
  async createComponent(@Body() dto: CreateKnowledgeComponentDto) {
    const data = await this.knowledgeComponentService.createComponent(dto);
    return {
      message: "Knowledge component created successfully.",
      status: HttpStatus.CREATED,
      data,
    };
  }

  @Patch(":componentId")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN, BaseRoles.FREELANCER)
  async updateComponent(
    @Param("componentId", ParseUUIDPipe) componentId: string,
    @Body() dto: UpdateKnowledgeComponentDto,
  ) {
    const data = await this.knowledgeComponentService.updateComponent(
      componentId,
      dto,
    );
    return {
      message: "Knowledge component updated successfully.",
      status: HttpStatus.OK,
      data,
    };
  }

  @Delete(":componentId")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN, BaseRoles.FREELANCER)
  async deleteComponent(
    @Param("componentId", ParseUUIDPipe) componentId: string,
  ) {
    await this.knowledgeComponentService.deleteComponent(componentId);
    return {
      message: "Knowledge component deleted successfully.",
      status: HttpStatus.OK,
    };
  }

  @Post("courses/:courseId/import")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN, BaseRoles.FREELANCER)
  @UseInterceptors(FileInterceptor("file"))
  async importForCourse(
    @Param("courseId", ParseUUIDPipe) courseId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        "Please provide a CSV or Excel file under the 'file' field.",
      );
    }

    const result =
      await this.knowledgeComponentService.importCourseComponentsFromFile(
        courseId,
        file,
      );

    return {
      message: "Knowledge components imported successfully.",
      data: result,
    };
  }
}
