import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GenerationRequest } from "./entities/generation-request.entity";
import { GenerationItem } from "./entities/generation-item.entity";
import { CreateGenerationRequestDto } from "./dto/create-generation-request.dto";
import { GenerationRequestStatus } from "./enums/generation-request-status.enum";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { GenerationItemType } from "./enums/generation-item-type.enum";
import { GenerationItemStatus } from "./enums/generation-item-status.enum";
import { UpdateGenerationItemDto } from "./dto/update-generation-item.dto";
import { RejectGenerationItemDto } from "./dto/reject-generation-item.dto";
import { McqService } from "src/mcq/mcq.service";
import { McqDifficulty, McqTag, McqType, QuizType } from "src/mcq/dto/mcq.type";
import { CreateMcqDto } from "src/mcq/dto/create-mcq.dto";
import { GenerationAiService } from "./generation-ai.service";
import { KnowledgeComponentService } from "src/knowledge-component/knowledge-component.service";

@Injectable()
export class GenerationService {
  constructor(
    @InjectRepository(GenerationRequest)
    private readonly generationRequestRepository: Repository<GenerationRequest>,
    @InjectRepository(GenerationItem)
    private readonly generationItemRepository: Repository<GenerationItem>,
    private readonly mcqService: McqService,
    private readonly generationAiService: GenerationAiService,
    private readonly knowledgeComponentService: KnowledgeComponentService,
  ) {}

  async createRequest(
    freelancer: JwtPayload,
    dto: CreateGenerationRequestDto,
  ) {
    const mcqCount = dto.requestedCounts?.mcq ?? 0;
    const qrocCount = dto.requestedCounts?.qroc ?? 0;

    if (mcqCount === 0 && qrocCount === 0) {
      throw new BadRequestException("At least one item must be requested");
    }

    if (!dto.contentTypes || dto.contentTypes.length === 0) {
      throw new BadRequestException("Select at least one content type");
    }

    const invalidTypes = dto.contentTypes.filter(
      (type) =>
        !Object.values(GenerationItemType).includes(type as GenerationItemType),
    );

    if (invalidTypes.length > 0) {
      throw new BadRequestException(
        `Unsupported content types: ${invalidTypes.join(", ")}`,
      );
    }

    if (!dto.unit) {
      throw new BadRequestException("Unit is required");
    }

    if (!dto.knowledge_component_ids || dto.knowledge_component_ids.length === 0) {
      throw new BadRequestException(
        "Select at least one knowledge component for this generation request",
      );
    }

    try {
      await this.knowledgeComponentService.getComponentsByIds(
        dto.knowledge_component_ids,
        {
          ensureAll: true,
        },
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const request = this.generationRequestRepository.create({
      freelancer: { id: freelancer.id } as any,
      university: { id: dto.university } as any,
      faculty: { id: dto.faculty } as any,
      unit: dto.unit ? ({ id: dto.unit } as any) : null,
      subject: { id: dto.subject } as any,
      course: { id: dto.course } as any,
      year_of_study: dto.year_of_study,
      difficulty: dto.difficulty ?? McqDifficulty.medium,
      requested_mcq_count: mcqCount,
      requested_qroc_count: qrocCount,
      content_types: dto.contentTypes,
      status: GenerationRequestStatus.AWAITING_UPLOAD,
      source_file_name: dto.sourceFileName ?? null,
      source_file_mime: dto.sourceFileMime ?? null,
      source_file_size: dto.sourceFileSize ?? null,
      knowledge_components: dto.knowledge_component_ids,
    });

    return this.generationRequestRepository.save(request);
  }

  private async ensureOwnership(
    requestId: string,
    freelancer: JwtPayload,
    withRelations: boolean = false,
  ) {
    const request = await this.generationRequestRepository.findOne({
      where: {
        id: requestId,
        freelancer: { id: freelancer.id },
      },
      relations: withRelations
        ? {
            freelancer: true,
            university: true,
            faculty: true,
            unit: true,
            subject: { unit: true },
            course: true,
            items: true,
          }
        : {
            freelancer: true,
          },
    });
    if (!request) {
      throw new NotFoundException("Generation request not found");
    }
    return request;
  }

  async uploadSource(
    requestId: string,
    freelancer: JwtPayload,
    file: Express.Multer.File,
  ) {
    const request = await this.ensureOwnership(requestId, freelancer);

    if (!file) {
      throw new BadRequestException("No file received");
    }

    request.source_file_name = file.originalname;
    request.source_file_mime = file.mimetype;
    request.source_file_size = file.size;
    request.source_file_url = (file as any).path ?? null;
    request.source_file_public_id = null;
    request.source_file_openai_id = null;
    request.uploaded_at = new Date();
    request.status = GenerationRequestStatus.UPLOAD_IN_PROGRESS;

    return this.generationRequestRepository.save(request);
  }

  async confirmUpload(requestId: string, freelancer: JwtPayload) {
    const request = await this.ensureOwnership(requestId, freelancer, true);

    if (!request.source_file_url) {
      throw new BadRequestException("File upload not completed");
    }

    if (
      request.status === GenerationRequestStatus.READY_FOR_REVIEW &&
      request.items &&
      request.items.length > 0
    ) {
      return request;
    }

    request.status = GenerationRequestStatus.PROCESSING;
    await this.generationRequestRepository.save(request);

    try {
      let openAiFileId = request.source_file_openai_id ?? null;

      if (!openAiFileId) {
        openAiFileId = await this.generationAiService.uploadSourceFile({
          filePath: request.source_file_url!,
          originalName:
            request.source_file_name ?? `generation-request-${request.id}`,
        });

        request.source_file_openai_id = openAiFileId;
        await this.generationRequestRepository.save(request);
      }

      const resolveName = (entity: any) =>
        entity?.name ?? entity?.title ?? entity?.label ?? null;

      const generatedItems = await this.generationAiService.generateItemsFromSource({
          mcqCount: request.requested_mcq_count,
          qrocCount: request.requested_qroc_count,
          difficulty: request.difficulty,
          courseName: resolveName(request.course) ?? "Course",
          yearOfStudy: request.year_of_study,
          unitName: resolveName(request.unit),
          subjectName: resolveName(request.subject),
          openAiFileId,
        });

      if (!generatedItems.length) {
        throw new Error("AI generation returned no questions");
      }

      const items = generatedItems.map((item) => {
        return this.generationItemRepository.create({
          request: { id: request.id } as GenerationRequest,
          type: item.type,
          stem: item.stem,
          options:
            item.type === GenerationItemType.MCQ ? item.options ?? [] : [],
          expected_answer:
            item.type === GenerationItemType.QROC
              ? item.expected_answer ?? ""
              : null,
          status: GenerationItemStatus.PENDING_REVIEW,
        });
      });

      const savedItems = await this.generationItemRepository.save(items);
      if (!savedItems.length) {
        throw new Error("No items persisted for this generation request");
      }

      request.status = GenerationRequestStatus.READY_FOR_REVIEW;
      await this.generationRequestRepository.save(request);
      return this.ensureOwnership(requestId, freelancer, true);
    } catch (error) {
      request.status = GenerationRequestStatus.FAILED;
      await this.generationRequestRepository.save(request);
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : "AI generation failed. Please try again later.",
      );
    }
  }

  async listRequests(freelancer: JwtPayload) {
    return this.generationRequestRepository.find({
      where: { freelancer: { id: freelancer.id } },
      order: { createdAt: "DESC" },
    });
  }

  async getRequest(requestId: string, freelancer: JwtPayload) {
    return this.ensureOwnership(requestId, freelancer, true);
  }

  async getItems(requestId: string, freelancer: JwtPayload) {
    await this.ensureOwnership(requestId, freelancer);

    return this.generationItemRepository.find({
      where: {
        request: {
          id: requestId,
          freelancer: { id: freelancer.id },
        },
      },
      order: { createdAt: "ASC" },
    });
  }

  private validateItemPayload(item: UpdateGenerationItemDto) {
    if (!item.stem?.trim()) {
      throw new BadRequestException("Stem is required");
    }

    if (item.type === GenerationItemType.MCQ) {
      if (!item.options || item.options.length < 2) {
        throw new BadRequestException("MCQ requires at least two options");
      }
      if (!item.options.some((option) => option.is_correct)) {
        throw new BadRequestException("Mark at least one option as correct");
      }
    }

    if (item.type === GenerationItemType.QROC) {
      if (!item.expected_answer || !item.expected_answer.trim()) {
        throw new BadRequestException("QROC requires an expected answer");
      }
    }
  }

  async updateItem(
    requestId: string,
    itemId: string,
    freelancer: JwtPayload,
    payload: UpdateGenerationItemDto,
  ) {
    await this.ensureOwnership(requestId, freelancer);
    this.validateItemPayload(payload);

    const item = await this.generationItemRepository.findOne({
      where: { id: itemId, request: { id: requestId } },
    });

    if (!item) {
      throw new NotFoundException("Generation item not found");
    }

    if (item.status === GenerationItemStatus.APPROVED) {
      throw new ForbiddenException("Cannot edit an approved item");
    }

    item.type = payload.type;
    item.stem = payload.stem;
    item.options = payload.options ?? [];
    item.expected_answer = payload.expected_answer ?? null;
    item.status = GenerationItemStatus.PENDING_REVIEW;
    item.rejection_reason = null;

    return this.generationItemRepository.save(item);
  }

  async approveItem(requestId: string, itemId: string, freelancer: JwtPayload) {
    const item = await this.generationItemRepository.findOne({
      where: {
        id: itemId,
        request: { id: requestId, freelancer: { id: freelancer.id } },
      },
      relations: { request: true },
    });

    if (!item) {
      throw new NotFoundException("Generation item not found");
    }

    this.validateItemPayload({
      stem: item.stem,
      type: item.type,
      options: item.options,
      expected_answer: item.expected_answer ?? undefined,
    });

    item.status = GenerationItemStatus.APPROVED;
    item.rejection_reason = null;
    return this.generationItemRepository.save(item);
  }

  async rejectItem(
    requestId: string,
    itemId: string,
    freelancer: JwtPayload,
    payload: RejectGenerationItemDto,
  ) {
    const item = await this.generationItemRepository.findOne({
      where: {
        id: itemId,
        request: { id: requestId, freelancer: { id: freelancer.id } },
      },
    });

    if (!item) {
      throw new NotFoundException("Generation item not found");
    }

    item.status = GenerationItemStatus.REJECTED;
    item.rejection_reason = payload.reason ?? null;
    return this.generationItemRepository.save(item);
  }

  async finalize(requestId: string, freelancer: JwtPayload) {
    const request = await this.ensureOwnership(requestId, freelancer, true);

    if (!request.items || request.items.length === 0) {
      throw new BadRequestException("No generated items to finalize");
    }

    const approvedItems = request.items.filter(
      (item) => item.status === GenerationItemStatus.APPROVED,
    );

    if (approvedItems.length === 0) {
      throw new BadRequestException(
        "Approve at least one item before finalizing",
      );
    }

    const createdMcqs = [];
    for (const item of approvedItems) {
      const unitId =
        request.unit?.id ?? request.subject?.unit?.id ?? null;

      if (!unitId) {
        throw new BadRequestException(
          "Unit information is required for MCQ creation",
        );
      }

      const dto: CreateMcqDto = {
        year_of_study: request.year_of_study,
        type:
          item.type === GenerationItemType.QROC ? McqType.qroc : McqType.qcm,
        estimated_time: 10,
        mcq_tags: McqTag.exam,
        quiz_type: QuizType.theorique,
        question: item.stem,
        answer:
          item.type === GenerationItemType.QROC
            ? item.expected_answer ?? ""
            : undefined,
        baseline: 1,
        options:
          item.type === GenerationItemType.MCQ
            ? item.options.map((option) => ({
                content: option.content,
                is_correct: option.is_correct,
              }))
            : undefined,
        explanation: undefined,
        difficulty: request.difficulty ?? McqDifficulty.medium,
        promo: new Date().getFullYear(),
        university: request.university.id,
        faculty: request.faculty.id,
        unit: unitId,
        subject: request.subject.id,
        course: request.course.id,
        knowledge_component_ids: request.knowledge_components ?? [],
      } as CreateMcqDto;

      const mcq = await this.mcqService.create(dto, null, freelancer);
      createdMcqs.push(mcq);

      item.status = GenerationItemStatus.CONVERTED;
      await this.generationItemRepository.save(item);
    }

    request.status = GenerationRequestStatus.COMPLETED;
    await this.generationRequestRepository.save(request);

    return {
      generated: createdMcqs.length,
    };
  }
}
