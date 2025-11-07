import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FreelancerService } from "./freelancer.service";
import { UpdateFreelancerDto } from "./dto/update-freelancer.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { UpdateFreelancerPasswordDto } from "./dto/update-Freelancer-Password.dto";
import { UpdateFreelancerEmailDto } from "./dto/update-freelancer-email.dto";
import { Freelancer } from "./entities/freelancer.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterConfig } from "config/multer.config";

@ApiTags("Freelancer")
@Controller("freelancer")
export class FreelancerController {
  constructor(private readonly freelancerService: FreelancerService) {}

  @Get("/top-freelancers")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @ApiOperation({ summary: "get today top 5 freelancers count " })
  async getTopFreelancersOfDay(@Query("date") date_string: string) {
    const date = date_string ? new Date(date_string) : new Date();
    const data =
      await this.freelancerService.getTopFreelancersOfDay(date_string);
    return {
      message: "Mcq fetched succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("dashboard/summary")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  async getDashboardSummary(@GetUser() freelancer: Freelancer) {
    const data = await this.freelancerService.getDashboardSummary(freelancer.id);
    return {
      message: "freelancer dashboard summary fetched",
      status: HttpStatus.OK,
      data,
    };
  }

  @ApiOperation({
    summary: "get freelancer profile (by token) ",
  })
  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  async freelancerProfile(@GetUser() freelancer: Freelancer) {
    const data = freelancer;
    return {
      message: "freelancer profile fetched",
      status: HttpStatus.OK,
      data,
    };
  }

  @ApiOperation({
    summary: "get freelancer profile by freelancerId",
  })
  @Get(":freelancerId")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER, BaseRoles.USER, BaseRoles.ADMIN)
  async findOne(@Param("freelancerId") freelancerId: string) {
    const data = await this.freelancerService.getOneById(freelancerId);
    return {
      message: "freelancer fetched",
      status: HttpStatus.OK,
      data,
    };
  }

  @ApiOperation({
    summary: "update freelancer profile (not for password) , (by token) ",
  })
  @Patch("")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  async update(
    @GetUser() freelancer: Freelancer,

    @Body() updateFreelancerDto: UpdateFreelancerDto,
  ) {
    await this.freelancerService.update(freelancer, updateFreelancerDto);
    return {
      message: "freelancer profile updated",
      status: HttpStatus.OK,
    };
  }

  @Patch("/image")
  @ApiOperation({ summary: "update freelancer image" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  @UseInterceptors(FileInterceptor("image", MulterConfig))
  async updateImage(
    @GetUser() freelancer: Freelancer,
    @UploadedFile() image: Express.Multer.File,
  ) {
    await this.freelancerService.updateImage(freelancer, image);
    return {
      message: "freelancer image updated",
      status: HttpStatus.OK,
    };
  }

  @ApiOperation({
    summary: "update freelancer password",
  })
  @Patch("/password")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  async updatePassword(
    @GetUser() freelancer: Freelancer,
    @Body() updateFreelancerPasswordDto: UpdateFreelancerPasswordDto,
  ) {
    await this.freelancerService.updatePassword(
      freelancer.id,
      updateFreelancerPasswordDto,
    );
    return {
      message: "freelancer password updated",
      status: HttpStatus.OK,
    };
  }

  @ApiOperation({
    summary: "update freelancer email",
  })
  @Patch("/email")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  async updateEmail(
    @GetUser() freelancer: Freelancer,

    @Body() updateFreelancerEmailDto: UpdateFreelancerEmailDto,
  ) {
    await this.freelancerService.updateEmail(
      freelancer.id,
      updateFreelancerEmailDto,
    );
    return {
      message: "freelancer email updated",
      status: HttpStatus.OK,
    };
  }

  @ApiOperation({
    summary: "delete freelancer profile (by token)",
  })
  @Delete("")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  async remove(@GetUser() freelancer: Freelancer) {
    await this.freelancerService.remove(freelancer);
    return {
      message: "freelancer profile deleted",
      status: HttpStatus.OK,
    };
  }
}
