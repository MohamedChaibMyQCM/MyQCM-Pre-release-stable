import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { GenerationService } from "./generation.service";
import { CreateGenerationRequestDto } from "./dto/create-generation-request.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { FileInterceptor } from "@nestjs/platform-express";
import { GenerationMulterConfig } from "config/generation-multer.config";
import { UpdateGenerationItemDto } from "./dto/update-generation-item.dto";
import { RejectGenerationItemDto } from "./dto/reject-generation-item.dto";

@Controller("generation/requests")
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(BaseRoles.FREELANCER)
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post()
  async createRequest(
    @Body() dto: CreateGenerationRequestDto,
    @GetUser() freelancer: JwtPayload,
  ) {
    const request = await this.generationService.createRequest(
      freelancer,
      dto,
    );
    return {
      message: "Generation request created",
      status: 201,
      data: {
        id: request.id,
        uploadUrl: `/generation/requests/${request.id}/upload`,
      },
    };
  }

  @Put(":requestId/upload")
  @UseInterceptors(FileInterceptor("file", GenerationMulterConfig))
  async upload(
    @Param("requestId", ParseUUIDPipe) requestId: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() freelancer: JwtPayload,
  ) {
    const request = await this.generationService.uploadSource(
      requestId,
      freelancer,
      file,
    );
    return {
      message: "Source uploaded successfully",
      status: 200,
      data: {
        id: request.id,
        status: request.status,
      },
    };
  }

  @Post(":requestId/confirm-upload")
  async confirmUpload(
    @Param("requestId", ParseUUIDPipe) requestId: string,
    @GetUser() freelancer: JwtPayload,
  ) {
    const request = await this.generationService.confirmUpload(
      requestId,
      freelancer,
    );
    return {
      message: "Upload confirmed",
      status: 200,
      data: request,
    };
  }

  @Get()
  async list(@GetUser() freelancer: JwtPayload) {
    const data = await this.generationService.listRequests(freelancer);
    return {
      message: "Generation requests fetched",
      status: 200,
      data,
    };
  }

  @Get(":requestId")
  async getRequest(
    @Param("requestId", ParseUUIDPipe) requestId: string,
    @GetUser() freelancer: JwtPayload,
  ) {
    const data = await this.generationService.getRequest(requestId, freelancer);
    return {
      message: "Generation request fetched",
      status: 200,
      data,
    };
  }

  @Get(":requestId/items")
  async getItems(
    @Param("requestId", ParseUUIDPipe) requestId: string,
    @GetUser() freelancer: JwtPayload,
  ) {
    const data = await this.generationService.getItems(
      requestId,
      freelancer,
    );
    return {
      message: "Generation items fetched",
      status: 200,
      data,
    };
  }

  @Put(":requestId/items/:itemId")
  async updateItem(
    @Param("requestId", ParseUUIDPipe) requestId: string,
    @Param("itemId", ParseUUIDPipe) itemId: string,
    @Body() payload: UpdateGenerationItemDto,
    @GetUser() freelancer: JwtPayload,
  ) {
    const data = await this.generationService.updateItem(
      requestId,
      itemId,
      freelancer,
      payload,
    );
    return {
      message: "Generation item updated",
      status: 200,
      data,
    };
  }

  @Post(":requestId/items/:itemId/approve")
  async approveItem(
    @Param("requestId", ParseUUIDPipe) requestId: string,
    @Param("itemId", ParseUUIDPipe) itemId: string,
    @GetUser() freelancer: JwtPayload,
  ) {
    const data = await this.generationService.approveItem(
      requestId,
      itemId,
      freelancer,
    );
    return {
      message: "Generation item approved",
      status: 200,
      data,
    };
  }

  @Post(":requestId/items/:itemId/reject")
  async rejectItem(
    @Param("requestId", ParseUUIDPipe) requestId: string,
    @Param("itemId", ParseUUIDPipe) itemId: string,
    @Body() payload: RejectGenerationItemDto,
    @GetUser() freelancer: JwtPayload,
  ) {
    const data = await this.generationService.rejectItem(
      requestId,
      itemId,
      freelancer,
      payload,
    );
    return {
      message: "Generation item rejected",
      status: 200,
      data,
    };
  }

  @Post(":requestId/finalize")
  async finalize(
    @Param("requestId", ParseUUIDPipe) requestId: string,
    @GetUser() freelancer: JwtPayload,
  ) {
    const data = await this.generationService.finalize(
      requestId,
      freelancer,
    );
    return {
      message: "Generation request finalized",
      status: 200,
      data,
    };
  }
}
