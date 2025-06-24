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
    const { mcqs, ...clinicalCaseData } = createClinicalCaseDto;

    // Start a transaction to ensure atomicity
    return this.clinicalCaseRepository.manager.transaction(
      async (transactionEntityManager) => {
        const clinical_case = this.clinicalCaseRepository.create({
          ...clinicalCaseData,
          university: { id: createClinicalCaseDto.university },
          faculty: { id: createClinicalCaseDto.faculty },
          unit: { id: createClinicalCaseDto.unit },
          subject: { id: createClinicalCaseDto.subject },
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

    await this.clinicalCaseRepository.manager.transaction(
      async (transactionEntityManager) => {
        await this.mcqService.createMcqInClinicalCase(
          createMcqInClinicalCaseDto,
          clinicalCase,
          freelancer,
          transactionEntityManager,
        );
      },
    );
  }

  async findAll(page: number = 1, limit: number = 20) {
    const [clincal_cases, total] =
      await this.clinicalCaseRepository.findAndCount({
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
  ) {
    const clinical_case = await this.clinicalCaseRepository.findOne({
      where: {
        id: clinicalCaseId,
      },
      relations: ["freelancer"],
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
    Object.assign(clincal_case, updateClinicalCaseDto);
    await this.clinicalCaseRepository.save(clincal_case);
    return clincal_case;
  }

  async remove(clinicalCaseId: string) {
    const deleted = await this.clinicalCaseRepository.delete(clinicalCaseId);
    if (deleted.affected == 0)
      throw new NotFoundException("Clinical case not found");
    return true;
  }
}
