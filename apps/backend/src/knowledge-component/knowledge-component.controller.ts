import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { KnowledgeComponentService } from "./knowledge-component.service";
import { FileInterceptor } from "@nestjs/platform-express";

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

  @Post("courses/:courseId/import")
  @UseInterceptors(FileInterceptor("file"))
  async importForCourse(
    @Param("courseId") courseId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("Please provide a CSV or Excel file under the 'file' field.");
    }

    const result = await this.knowledgeComponentService.importCourseComponentsFromFile(
      courseId,
      file,
    );

    return {
      message: "Knowledge components imported successfully.",
      data: result,
    };
  }
}
