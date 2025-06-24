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
  Query,
  UploadedFile,
} from "@nestjs/common";
import { FacultyService } from "./faculty.service";
import { CreateFacultyDto } from "./types/dtos/create-faculty.dto";
import { UpdateFacultyDto } from "./types/dtos/update-faculty.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { ApiConsumes, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { Roles } from "common/decorators/auth/roles.decorator";
import { MulterConfig } from "config/multer.config";
@ApiTags("Faculty")
@Controller("faculty")
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  @ApiOperation({ summary: "create new faculty (form data)" })
  @ApiConsumes("multipart/form-data")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  @UseInterceptors(FileInterceptor("attachment", MulterConfig))
  async create(
    @UploadedFile() attachment: Express.Multer.File,
    @Body() createFacultyDto: CreateFacultyDto,
  ) {
    const data = await this.facultyService.create(createFacultyDto, attachment);
    return {
      message: "Faculty cretaed succesfully",
      status: HttpStatus.CREATED,
    };
  }

  @Get()
  @ApiOperation({ summary: "get all faculties" })
  @ApiQuery({ name: "universityId", required: false })
  @UseGuards(AccessTokenGuard, RolesGuard)
  async findAll(@Query("universityId") universityId: string) {
    const data = await this.facultyService.findAll(universityId);
    return {
      message: "Faculties fetched succesfully",
      status: HttpStatus.CREATED,
      data,
    };
  }

  @Get(":facultyId")
  @ApiOperation({ summary: "get faculty by id" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  async findOne(@Param("facultyId", new ParseUUIDPipe()) facultyId: string) {
    const data = await this.facultyService.findOne(facultyId);
    return {
      message: "Faculty fetched succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Patch(":facultyId")
  @ApiOperation({ summary: "update faculty" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async update(
    @Param("facultyId", new ParseUUIDPipe()) facultyId: string,
    @Body() updateFacultyDto: UpdateFacultyDto,
  ) {
    const data = await this.facultyService.update(facultyId, updateFacultyDto);
    return {
      message: "Faculty updated succesfully",
      status: HttpStatus.OK,
    };
  }
  @Patch("/attachment/:facultyId")
  @ApiOperation({ summary: "update faculty attachment" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  @UseInterceptors(FileInterceptor("attachment", MulterConfig))
  async updateAttachment(
    @Param("facultyId", new ParseUUIDPipe()) facultyId: string,
    @UploadedFile() attachment: Express.Multer.File,
  ) {
    const data = await this.facultyService.updateAttachment(
      facultyId,
      attachment,
    );
    return {
      message: "Faculty updated succesfully",
      status: HttpStatus.OK,
    };
  }

  @Delete(":facultyId")
  @ApiOperation({ summary: "delete faculty" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async remove(@Param("facultyId", new ParseUUIDPipe()) facultyId: string) {
    const data = await this.facultyService.remove(facultyId);
    return {
      message: "Faculty deleted succesfully",
      status: HttpStatus.OK,
    };
  }
}
