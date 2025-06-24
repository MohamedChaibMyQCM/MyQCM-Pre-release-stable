import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUnitDto } from "./types/dto/create-unit.dto";
import { UpdateUnitDto } from "./types/dto/update-unit.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Unit } from "./entities/unit.entity";
import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { UserProfileService } from "src/user/services/user-profile.service";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { default_offset, default_page } from "shared/constants/pagination";
import { UnitFilters } from "./types/interfaces/unit-filters.interface";
import { ProgressService } from "src/progress/progress.service";
import { McqService } from "src/mcq/mcq.service";

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    private readonly userProfileService: UserProfileService,
    private readonly mcqService: McqService,
    private readonly progressService: ProgressService,
  ) {}

  async create(createUnitDto: CreateUnitDto, attachment: Express.Multer.File) {
    if (!attachment) throw new BadRequestException("Attachment not provided");
    const unit = this.unitRepository.create({
      ...createUnitDto,
      attachment: attachment.path,
    });
    return await this.unitRepository.save(unit);
  }

  async findUnitsPaginated(
    filters: UnitFilters = {},
    pagination: PaginationInterface = {
      page: default_page,
      offset: default_offset,
    },
  ) {
    const [units, total] = await this.unitRepository.findAndCount({
      where: this.generateWhereClauseFromFilters(filters),
      skip: (pagination.page - 1) * pagination.offset,
      take: pagination.offset,
    });
    return {
      units,
      total,
    };
  }
  async getUnitsByUserPaginated(
    user: JwtPayload,
    filters: UnitFilters = {},
    pagination: PaginationInterface = {
      page: default_page,
      offset: default_offset,
    },
  ) {
    const { year_of_study } =
      await this.userProfileService.getAuthenticatedUserProfileById(user.id);
    const { units, total } = await this.findUnitsPaginated(
      {
        ...filters,
        year_of_study,
      },
      pagination,
    );

    const [user_progress_count, unit_mcq_count] = await Promise.all([
      // Get progress data (how many MCQs the user has attempted per unit)
      await this.progressService.countMcqsProgressByMultipleFilters(
        {
          user: user.id,
          units: units.map((unit) => unit.id) || [],
        },
        {
          distinct: true,
        },
      ),

      // Get total MCQ counts per unit
      await this.mcqService.countMcqsByMultipleFilters({
        units: units.map((unit) => unit.id),
      }),
    ]);

    const progress_map = new Map(
      user_progress_count.map((item) => [item.unitId, item.count]),
    );

    const mcq_count_map = new Map(
      unit_mcq_count.map((item) => [item.unitId, item.count]),
    );

    const final_units = units.map((unit) => {
      const attempted = progress_map.get(unit.id) || 0;
      const total = mcq_count_map.get(unit.id) || 0;

      return {
        ...unit,
        attempted,
        total,
        progress_percentage:
          total > 0 ? Math.floor((attempted / total) * 100) : 0,
      };
    });
    return {
      data: final_units,
      pages: Math.ceil(total / pagination.offset),
      total,
      page: pagination.page,
      offset: pagination.offset,
    };
  }

  async findOne(unitId: string, populate: boolean = false) {
    const relations = populate ? [""] : [];
    const unit = await this.unitRepository.findOne({
      where: {
        id: unitId,
      },
      relations,
    });
    if (!unit) throw new NotFoundException("unit not found");
    return unit;
  }

  async update(unitId: string, updateUnitDto: UpdateUnitDto) {
    return this.unitRepository.update(unitId, updateUnitDto);
  }

  async updateAttachment(unitId: string, attachment: Express.Multer.File) {
    if (!attachment) throw new BadRequestException("Attachment not provided");
    const unit = await this.findOne(unitId);
    unit.attachment = attachment.path;
    return this.unitRepository.save(unit);
  }

  async remove(unitId: string) {
    const deleted = await this.unitRepository.delete(unitId);
    if (deleted.affected == 0) throw new NotFoundException("unit not found");
    return true;
  }

  /**
   * Generates a TypeORM where clause from the provided filters for Unit queries.
   *
   * @param {UnitFilters} filters - The filters to apply to the query
   * @returns {FindOptionsWhere<Unit>} The TypeORM where clause object
   */
  private generateWhereClauseFromFilters(
    filters: UnitFilters = {},
  ): FindOptionsWhere<Unit> {
    let where_clause: FindOptionsWhere<Unit> = {};

    if (filters.name) {
      where_clause.name = ILike(`%${filters.name}%`);
    }

    if (filters.description) {
      where_clause.description = ILike(`%${filters.description}%`);
    }

    if (filters.year_of_study) {
      where_clause.year_of_study = filters.year_of_study;
    }

    return where_clause;
  }
}
