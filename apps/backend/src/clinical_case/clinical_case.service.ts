import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateClinicalCaseDto } from "./dto/create-clinical_case.dto";
import { UpdateClinicalCaseDto } from "./dto/update-clinical_case.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ClinicalCase } from "./entities/clinical_case.entity";
import { Between, Repository } from "typeorm";
import { McqService } from "src/mcq/mcq.service";
import { endOfDay, startOfDay } from "date-fns";
import { Freelancer } from "src/freelancer/entities/freelancer.entity";
import { CreateMcqInClinicalCase } from "src/mcq/dto/create-mcq.dto";
import { UpdateMcqDto } from "src/mcq/dto/update-mcq.dto";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";

@Injectable()
export class ClinicalCaseService {
  constructor(
    @InjectRepository(ClinicalCase)
    private readonly clinicalCaseRepository: Repository<ClinicalCase>,
    private readonly mcqService: McqService,
  ) {}

  async create(
    createClinicalCaseDto: CreateClinicalCaseDto,
    freelancer: Freelancer,
  ) {
    const {
      mcqs,
      university,
      faculty,
      unit,
      subject,
      objectives,
      tags = [],
      ...clinicalCaseData
    } = createClinicalCaseDto;

    // Start a transaction to ensure atomicity
    return this.clinicalCaseRepository.manager.transaction(
      async (transactionEntityManager) => {
        const clinical_case = this.clinicalCaseRepository.create({
          ...clinicalCaseData,
          objectives,
          tags,
          university: { id: university },
          faculty: { id: faculty },
          unit: { id: unit },
          subject: { id: subject },
          freelancer: { id: freelancer.id },
        });
        const savedClinicalCase =
          await transactionEntityManager.save(clinical_case);

        for (const mcq of mcqs) {
          await this.mcqService.createMcqInClinicalCase(
            { ...mcq, type: createClinicalCaseDto.type },
            savedClinicalCase,
            freelancer,
            transactionEntityManager,
          );
        }

        return savedClinicalCase;
      },
    );
  }

  async addMcqToClinicalCase(
    createMcqInClinicalCaseDto: CreateMcqInClinicalCase,
    clinicalCaseId: string,
    freelancer: Freelancer,
  ) {
    const clinicalCase = await this.checkCaseBelongToFreelancer(
      clinicalCaseId,
      freelancer.id,
    );

    if (!createMcqInClinicalCaseDto.type) {
      throw new BadRequestException("Type is required");
    }

    return this.clinicalCaseRepository.manager.transaction(
      async (transactionEntityManager) => {
        const savedMcq = await this.mcqService.createMcqInClinicalCase(
          createMcqInClinicalCaseDto,
          clinicalCase,
          freelancer,
          transactionEntityManager,
        );
        return savedMcq;
      },
    );
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    filters?: { year_of_study?: YearOfStudy },
  ) {
    const [clincal_cases, total] =
      await this.clinicalCaseRepository.findAndCount({
        where: filters?.year_of_study
          ? { year_of_study: filters.year_of_study }
          : undefined,
        take: limit,
        skip: (page - 1) * limit,
      });
    return {
      clincal_cases,
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    };
  }

  async getAllClinicalCaseByFreelancer(
    freelancer: Freelancer,
    page: number = 1,
    limit: number = 20,
  ) {
    const [clincal_cases, total] =
      await this.clinicalCaseRepository.findAndCount({
        where: {
          freelancer: {
            id: freelancer.id,
          },
        },
        relations: ["university", "faculty", "unit", "subject"],
        order: {
          createdAt: "DESC",
        },
        take: limit,
        skip: (page - 1) * limit,
      });
    return {
      clincal_cases,
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    };
  }

  async getClinicalCaseCount() {
    const startOfDayDate = startOfDay(new Date());
    const endOfDayDate = endOfDay(new Date());
    const clinicaCase_today_count = await this.clinicalCaseRepository.count({
      where: {
        createdAt: Between(startOfDayDate, endOfDayDate),
      },
    });
    const clinicaCase_total_count = await this.clinicalCaseRepository.count();
    return {
      clinicaCase_today_count,
      clinicaCase_total_count,
    };
  }

  async findOne(clinicalCaseId: string, populate: boolean = false) {
    const relations = populate
      ? [
          "mcqs",
          "mcqs.options",
          "mcqs.course",
          "university",
          "faculty",
          "unit",
          "subject",
          "freelancer",
        ]
      : [];
    const clinical_case = await this.clinicalCaseRepository.findOne({
      where: {
        id: clinicalCaseId,
      },
      relations,
    });
    if (!clinical_case) throw new NotFoundException("Clinical case not found ");
    return clinical_case;
  }

  async checkCaseBelongToFreelancer(
    clinicalCaseId: string,
    freelancerId: string,
    relations: string[] = ["freelancer"],
  ) {
    const uniqueRelations = Array.from(
      new Set([...(relations ?? []), "freelancer"]),
    );
    const clinical_case = await this.clinicalCaseRepository.findOne({
      where: {
        id: clinicalCaseId,
      },
      relations: uniqueRelations,
    });
    if (!clinical_case) throw new NotFoundException("Clinical case not found ");
    if (clinical_case.freelancer.id !== freelancerId) {
      throw new NotFoundException(
        "Clinical case does not belong to freelancer",
      );
    }
    return clinical_case;
  }

  async update(
    clinicalCaseId: string,
    freelancer: Freelancer,
    updateClinicalCaseDto: UpdateClinicalCaseDto,
  ) {
    const clincal_case = await this.checkCaseBelongToFreelancer(
      clinicalCaseId,
      freelancer.id,
    );
    const {
      objectives,
      tags,
      university,
      faculty,
      unit,
      subject,
      faculty_type,
      year_of_study,
      type,
      ...rest
    } = updateClinicalCaseDto;

    if (objectives !== undefined) {
      clincal_case.objectives = objectives;
    }
    if (tags !== undefined) {
      clincal_case.tags = tags;
    }
    if (faculty_type !== undefined) {
      clincal_case.faculty_type = faculty_type;
    }
    if (year_of_study !== undefined) {
      clincal_case.year_of_study = year_of_study;
    }
    if (type !== undefined) {
      clincal_case.type = type;
    }
    if (university) {
      clincal_case.university = { id: university } as any;
    }
    if (faculty) {
      clincal_case.faculty = { id: faculty } as any;
    }
    if (unit) {
      clincal_case.unit = { id: unit } as any;
    }
    if (subject) {
      clincal_case.subject = { id: subject } as any;
    }

    Object.assign(clincal_case, rest);
    return this.clinicalCaseRepository.save(clincal_case);
  }

  async remove(clinicalCaseId: string, freelancer: Freelancer) {
    const clinical_case = await this.checkCaseBelongToFreelancer(
      clinicalCaseId,
      freelancer.id,
      ["mcqs"],
    );

    const mcqIds = Array.isArray(clinical_case.mcqs)
      ? clinical_case.mcqs.map((mcq) => mcq.id)
      : [];

    for (const mcqId of mcqIds) {
      await this.mcqService.removeMcq(mcqId, freelancer);
    }

    const deleted = await this.clinicalCaseRepository.delete(clinicalCaseId);
    if (deleted.affected === 0) {
      throw new NotFoundException("Clinical case not found");
    }
    return true;
  }

  async findOneWithDetailsForFreelancer(
    clinicalCaseId: string,
    freelancer: Freelancer,
  ) {
    const data = await this.clinicalCaseRepository.findOne({
      where: {
        id: clinicalCaseId,
        freelancer: { id: freelancer.id },
      },
      relations: [
        "university",
        "faculty",
        "unit",
        "subject",
        "mcqs",
        "mcqs.options",
        "mcqs.course",
      ],
      order: {
        mcqs: {
          createdAt: "ASC",
        },
      },
    });

    if (!data) {
      throw new NotFoundException("Clinical case not found");
    }

    return data;
  }

  async updateMcqInClinicalCase(
    clinicalCaseId: string,
    mcqId: string,
    freelancer: Freelancer,
    updateMcqDto: UpdateMcqDto,
  ) {
    await this.checkCaseBelongToFreelancer(clinicalCaseId, freelancer.id);
    const mcq = await this.mcqService.getOneMcq(
      { mcqId, freelancerId: freelancer.id },
      true,
    );

    if (!mcq || mcq.clinical_case?.id !== clinicalCaseId) {
      throw new NotFoundException("MCQ not found in this clinical case");
    }

    await this.mcqService.update(mcqId, null, freelancer.id, updateMcqDto);
    return this.mcqService.getOneMcq(
      { mcqId, freelancerId: freelancer.id },
      true,
    );
  }

  async removeMcqFromClinicalCase(
    clinicalCaseId: string,
    mcqId: string,
    freelancer: Freelancer,
  ) {
    await this.checkCaseBelongToFreelancer(clinicalCaseId, freelancer.id);
    const mcq = await this.mcqService.getOneMcq(
      { mcqId, freelancerId: freelancer.id },
      true,
    );

    if (!mcq || mcq.clinical_case?.id !== clinicalCaseId) {
      throw new NotFoundException("MCQ not found in this clinical case");
    }

    await this.mcqService.removeMcq(mcqId, freelancer);
    return true;
  }
}
