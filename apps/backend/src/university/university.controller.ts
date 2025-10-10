import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { UniversityService } from "./university.service";
import { CreateUniversityDto } from "./dto/create-university.dto";
import { UpdateUniversityDto } from "./dto/update-university.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { Roles } from "common/decorators/auth/roles.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterConfig } from "config/multer.config";

@ApiTags("University")
@Controller("university")
export class UniversityController {
  constructor(private readonly universityService: UniversityService) {}

  @Post()
  @ApiOperation({ summary: "create new university (form data)" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @UseInterceptors(FileInterceptor("attachment", MulterConfig))
  @Roles(BaseRoles.ADMIN)
  async create(
    @Body() createUniversityDto: CreateUniversityDto,
    @UploadedFile() attachment: Express.Multer.File,
  ) {
    const university = await this.universityService.create(
      createUniversityDto,
      attachment,
    );
    return {
      message: "University cretaed succesfully",
      status: HttpStatus.CREATED,
    };
  }

  @Get()
  @ApiOperation({ summary: "get all universities" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  async findAll() {
    const data = await this.universityService.findAll();
    return {
      message: "Universities fetched succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get(":universityId")
  @ApiOperation({ summary: "get university by id" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  async findOne(
    @Param("universityId", new ParseUUIDPipe()) universityId: string,
  ) {
    const data = await this.universityService.findOne(universityId);
    return {
      message: "University fetched succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Patch("/:universityId")
  @ApiOperation({ summary: "update university info by id " })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async update(
    @Param("universityId", new ParseUUIDPipe()) universityId: string,
    @Body() updateUniversityDto: UpdateUniversityDto,
  ) {
    const data = await this.universityService.update(
      universityId,
      updateUniversityDto,
    );
    return {
      message: "University updated succesfully",
      status: HttpStatus.CREATED,
    };
  }
  @Patch("/attachment/:universityId")
  @ApiOperation({ summary: "update university attachment by id " })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  @UseInterceptors(FileInterceptor("attachment", MulterConfig))
  async updateAttachment(
    @Param("universityId", new ParseUUIDPipe()) universityId: string,
    @UploadedFile() attachment: Express.Multer.File,
  ) {
    const data = await this.universityService.updateAttachment(
      universityId,
      attachment,
    );
    return {
      message: "University attachment updated succesfully",
      status: HttpStatus.CREATED,
    };
  }

  @Delete(":universityId")
  @ApiOperation({ summary: "delete university by id" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async remove(
    @Param("universityId", new ParseUUIDPipe()) universityId: string,
  ) {
    const data = await this.universityService.remove(universityId);
    return {
      message: "University deleted succesfully",
      status: HttpStatus.CREATED,
    };
  }
}
