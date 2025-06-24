import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseEnumPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from "@nestjs/common";
import { UnitService } from "./unit.service";
import { CreateUnitDto } from "./types/dto/create-unit.dto";
import { UpdateUnitDto } from "./types/dto/update-unit.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "common/decorators/auth/roles.decorator";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterConfig } from "config/multer.config";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { UnitFilters } from "./types/interfaces/unit-filters.interface";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { default_offset, default_page } from "shared/constants/pagination";
@ApiTags("Unit")
@Controller("unit")
@UseGuards(AccessTokenGuard, RolesGuard)
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post("/")
  @ApiOperation({ summary: "create new unit (form data)" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @UseInterceptors(FileInterceptor("attachment", MulterConfig))
  async create(
    @Body() createUnitDto: CreateUnitDto,
    @UploadedFile() attachment: Express.Multer.File,
  ) {
    const unit = await this.unitService.create(createUnitDto, attachment);
    return {
      message: "unit cretaed succesfully",
      status: HttpStatus.CREATED,
    };
  }

  @Get("/")
  @ApiOperation({
    summary: "get all units for the admin paginated with filters",
  })
  @ApiQuery({
    name: "year_of_study",
    required: false,
    enum: YearOfStudy,
    example: YearOfStudy.first_year,
  })
  @ApiQuery({
    name: "page",
    description: "Page number",
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: "offset",
    description: "Items per page",
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: "name",
    description: "unit name",
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: "description",
    description: "unit description ",
    required: false,
    type: Number,
    example: 1,
  })
  async findAll(
    @Query("year_of_study", new ParseEnumPipe(YearOfStudy, { optional: true }))
    year_of_study: YearOfStudy,
    @Query("name") name?: string,
    @Query("description") description?: string,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ) {
    const filters: UnitFilters = {
      name,
      description,
      year_of_study,
    };
    const pagination: PaginationInterface = { page, offset };
    const data = await this.unitService.findUnitsPaginated(filters, pagination);
    return {
      message: "units fetched succesfully",
      status: HttpStatus.CREATED,
      data,
    };
  }

  @Get("/me")
  @ApiOperation({
    summary:
      "get all units for user based on his year of study (for the main home page)",
  })
  @ApiQuery({
    name: "page",
    description: "Page number",
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: "offset",
    description: "Items per page",
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: "name",
    description: "unit name",
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: "description",
    description: "unit description ",
    required: false,
    type: Number,
    example: 1,
  })
  @Roles(BaseRoles.USER)
  async getUnitForUser(
    @GetUser() user: JwtPayload,
    @Query("name") name?: string,
    @Query("description") description?: string,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ) {
    const filters: UnitFilters = {
      name,
      description,
    };
    const pagination: PaginationInterface = { page, offset };
    const data = await this.unitService.getUnitsByUserPaginated(
      user,
      filters,
      pagination,
    );
    return {
      message: "Unit fetched succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get(":unitId")
  @ApiOperation({ summary: "get unit by id " })
  async findOne(@Param("unitId", new ParseUUIDPipe()) unitId: string) {
    const data = await this.unitService.findOne(unitId);
    return {
      message: "unit fetched succesfully",
      status: HttpStatus.CREATED,
      data,
    };
  }

  @Patch(":unitId")
  @ApiOperation({ summary: "update unit " })
  @Roles(BaseRoles.ADMIN)
  async update(
    @Param("unitId", new ParseUUIDPipe()) unitId: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    const data = await this.unitService.update(unitId, updateUnitDto);
    return {
      message: "unit updated succesfully",
      status: HttpStatus.ACCEPTED,
    };
  }

  @Patch("/attachment/:unitId")
  @ApiOperation({ summary: "update faculty attachment" })
  @Roles(BaseRoles.ADMIN)
  @UseInterceptors(FileInterceptor("attachment", MulterConfig))
  async updateAttachment(
    @Param("unitId", new ParseUUIDPipe()) unitId: string,
    @UploadedFile() attachment: Express.Multer.File,
  ) {
    const data = await this.unitService.updateAttachment(unitId, attachment);
    return {
      message: "Faculty updated succesfully",
      status: HttpStatus.OK,
    };
  }

  @Delete(":unitId")
  @ApiOperation({ summary: "delete unit " })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async remove(@Param("unitId", new ParseUUIDPipe()) unitId: string) {
    const data = await this.unitService.remove(unitId);
    return {
      message: "unit deleted succesfully",
      status: HttpStatus.ACCEPTED,
    };
  }
}
