import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateSubjectDto } from "./types/dto/create-subject.dto";
import { UpdateSubjectDto } from "./types/dto/update-subject.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Subject } from "./entities/subject.entity";
import { FindOptionsWhere, ILike, IsNull, Not, Repository } from "typeorm";
import { UnitService } from "src/unit/unit.service";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { UserProfileService } from "src/user/services/user-profile.service";
import { SubjectFilters } from "./types/interfaces/subject-filters.interface";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { default_offset, default_page } from "shared/constants/pagination";
import { ProgressService } from "src/progress/progress.service";
import { McqService } from "src/mcq/mcq.service";

/**
 * Service responsible for managing subject-related operations
 * Handles CRUD operations for subjects, subject attachments, and tracking user progress
 */
@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly unitService: UnitService,
    private readonly userProfileService: UserProfileService,
    private readonly progressService: ProgressService,
    private readonly mcqService: McqService,
  ) {}

  /**
   * Creates a new subject.
   *
   * @param createSubjectDto - The DTO containing subject details
   * @param attachments - The uploaded files (icon and/or banner)
   * @returns The newly created Subject entity
   * @throws {BadRequestException} If a first-year subject lacks a semester
   * @throws {ConflictException} If subject-unit relationships are invalid
   */
  async create(
    createSubjectDto: CreateSubjectDto,
    attachments: {
      icon?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ): Promise<Subject> {
    const iconFile = attachments.icon?.[0] ?? null;
    const bannerFile = attachments.banner?.[0] ?? null;

    const { year_of_study, subject_semestre, unit: unitId } = createSubjectDto;

    // 🔐 Validate year-specific requirements
    if (year_of_study === YearOfStudy.first_year && !subject_semestre) {
      throw new BadRequestException(
        "First-year subjects must have a semester.",
      );
    }

    if (year_of_study !== YearOfStudy.first_year && !unitId) {
      throw new ConflictException(
        "Non–first-year subjects must have a unit assigned.",
      );
    }

    // Validate unit compatibility
    const unit = await this.unitService.findOne(unitId);
    if (year_of_study !== unit.year_of_study) {
      throw new ConflictException(
        "The subject's year of study does not match the unit's year.",
      );
    }

    // 🎯 Prepare subject data
    const subjectData: Partial<Subject> = {
      ...createSubjectDto,
      subject_semestre:
        year_of_study === YearOfStudy.first_year ? subject_semestre : undefined,
      unit,
      icon: iconFile?.path ?? null,
      banner: bannerFile?.path ?? null,
    };

    const subject = this.subjectRepository.create(subjectData);
    return this.subjectRepository.save(subject);
  }

  /**
   * Retrieves subjects with pagination according to specified filters.
   *
   * @param filters - The criteria to filter subjects
   * @param pagination - Pagination parameters
   *
   * @returns A paginated result object containing:
   *   - data: Array of course entities matching the filters
   *   - total: Total number of subjects matching the filters
   *   - page: Current page number
   *   - offset: Number of items per page
   *   - total_pages: Total number of pages available
   */
  async findSubjectsPaginated(
    filters: SubjectFilters = {},
    pagination: PaginationInterface = {
      page: default_page,
      offset: default_offset,
    },
  ) {
    const [subjects, total] = await this.subjectRepository.findAndCount({
      where: this.generateWhereClauseFromFilters(filters),
      skip: (pagination.page - 1) * pagination.offset,
      take: pagination.offset,
    });
    return {
      data: subjects,
      total,
      page: pagination.page,
      offset: pagination.offset,
      total_pages: Math.ceil(total / pagination.offset),
    };
  }

  /**
   * Retrieves subjects for a specific user with their progress information
   *
   * @param userId - The ID of the user to get subjects for
   * @param filters - Optional filtering criteria for subjects (year of study will be automatically set based on user)
   * @param pagination - Pagination parameters with default values
   * @returns An object containing:
   *   - data: Array of subjects with added progress information (attempted, total, progress_percentage)
   *   - total: Total number of subjects matching the filters
   *   - page: Current page number
   *   - offset: Number of items per page
   *   - total_pages: Total number of pages
   */
  async getSubjectsForUser(
    userId: string,
    filters: SubjectFilters = {}, //year of study will be exluded from here
    pagination: PaginationInterface = {
      page: default_page,
      offset: default_offset,
    },
  ) {
    const { year_of_study } =
      await this.userProfileService.getAuthenticatedUserProfileById(userId);
    const {
      data: subjects,
      total,
      total_pages,
    } = await this.findSubjectsPaginated(
      {
        ...filters,
        year_of_study,
      },
      pagination,
    );

    const subjects_ids = subjects.map((course) => course.id);

    const [user_progress_count, subject_mcq_count, subject_xp_data] =
      await Promise.all([
        // Get progress data (how many MCQs the user has attempted per subject)
        await this.progressService.countMcqsProgressByMultipleFilters(
          {
            user: userId,
            subjects: subjects_ids,
          },
          {
            distinct: true,
          },
        ),
        await this.mcqService.countMcqsByMultipleFilters({
          subjects: subjects_ids,
        }),
        // Get XP data (how much XP the user has gained per subject)
        await this.progressService.calculateXpByMultipleFilters({
          user: userId,
          subjects: subjects_ids,
        }),
      ]);

    const progress_map = new Map(
      user_progress_count.map((item) => [item.subjectId, item.count]),
    );

    const mcq_count_map = new Map(
      subject_mcq_count.map((item) => [item.subjectId, item.count]),
    );

    const xp_map = new Map(
      subject_xp_data.map((item) => [item.subjectId, item.totalXp]),
    );

    const final_subjects = subjects.map((course) => {
      const attempted = progress_map.get(course.id) || 0;
      const total = mcq_count_map.get(course.id) || 0;
      const totalXp = xp_map.get(course.id) || 0;

      return {
        ...course,
        attempted,
        total,
        total_xp: totalXp,
        progress_percentage:
          total > 0 ? Math.floor((attempted / total) * 100) : 0,
      };
    });

    return {
      data: final_subjects,
      total,
      page: pagination.page,
      offset: pagination.offset,
      total_pages,
    };
  }

  /**
   * Fetches a subject from the database by its unique identifier
   *
   * @param subjectId - The unique identifier of the subject to find
   * @returns {Promise<Subject>} A promise that resolves to the subject object if found, otherwise null
   */
  async findSubject(subjectId: string) {
    return this.subjectRepository.findOne({
      where: {
        id: subjectId,
      },
    });
  }

  /**
   * Retrieves a subject by its ID and throws an exception if not found
   *
   * @param subjectId - The unique identifier of the subject to retrieve
   * @returns {Promise<Subject>} The subject entity if found
   * @throws {NotFoundException} If the subject with the given ID doesn't exist
   */
  async getSubject(subjectId: string) {
    const subject = await this.findSubject(subjectId);

    if (!subject) throw new NotFoundException("subject not found");

    const mcq_count = await this.mcqService.countMcqsBySingleFilter(
      {
        subject: subjectId,
      },
      { groupByType: true },
    );
    return {
      ...subject,
      mcq_count,
    };
  }

  /**
   * Updates a subject with the provided data
   *
   * @param subjectId - The ID of the subject to update
   * @param updateSubjectDto - Data transfer object containing properties to update
   * @returns {Promise<Subject>} The updated subject entity
   * @throws {NotFoundException} If the subject with the given ID doesn't exist
   * @throws {BadRequestException} When validations fail, such as when a non-first year subject has no unit
   */
  async update(
    subjectId: string,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    const subject = await this.findSubject(subjectId);
    if (updateSubjectDto.unit !== undefined) {
      if (updateSubjectDto.unit === null) {
        subject.unit = null;
      } else {
        const unit = await this.unitService.findOne(updateSubjectDto.unit);
        subject.unit = unit;
      }
    }

    // Handle year_of_study update
    if (updateSubjectDto.year_of_study !== undefined) {
      if (updateSubjectDto.year_of_study === YearOfStudy.first_year) {
        subject.unit = null;
      } else if (!subject.unit) {
        throw new BadRequestException(
          "Subjects that are not for first year must have a unit",
        );
      }
    }

    // Handle subject_semestre update
    if (updateSubjectDto.year_of_study === YearOfStudy.first_year) {
      if (!updateSubjectDto.subject_semestre) {
        throw new BadRequestException(
          "Subject for first year must have a semester",
        );
      }
    } else {
      updateSubjectDto.subject_semestre = undefined;
    }

    // Update other properties
    Object.assign(subject, updateSubjectDto);

    return this.subjectRepository.save(subject);
  }

  /**
   * Updates the attachment file for a subject
   *
   * @param subjectId - The ID of the subject to update
   * @param attachment - The new file to attach to the subject
   * @returns {Promise<boolean>} True if the update was successful
   * @throws {BadRequestException} If the attachment is not provided
   * @throws {NotFoundException} If the subject with the given ID doesn't exist
   */
  async updateAttachments(
    subjectId: string,
    attachments: {
      icon?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ): Promise<boolean> {
    const subject = await this.findSubject(subjectId);
    if (!subject) {
      throw new NotFoundException("Subject not found");
    }

    const updateData: Partial<Subject> = {};

    if (attachments.icon?.length) {
      updateData.icon = attachments.icon[0].path;
    }

    if (attachments.banner?.length) {
      updateData.banner = attachments.banner[0].path;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException("No attachments provided");
    }

    await this.subjectRepository.update(subjectId, updateData);
    return true;
  }

  /**
   * Removes a subject from the database
   *
   * @param subjectId - The ID of the subject to remove
   * @returns {Promise<boolean>} True if the removal was successful
   * @throws {NotFoundException} If the subject with the given ID doesn't exist
   */
  async remove(subjectId: string) {
    const deleted = await this.subjectRepository.delete({ id: subjectId });
    if (deleted.affected == 0) throw new NotFoundException("subject not found");
    return true;
  }

  /**
   * Generates a TypeORM where clause from the provided filters for Course queries.
   *
   * @param {SubjectFilters} filters - The filters to apply to the query
   * @returns {FindOptionsWhere<Subject>} The TypeORM where clause object
   * @private
   */
  private generateWhereClauseFromFilters(
    filters: SubjectFilters = {},
  ): FindOptionsWhere<Subject> {
    let where_clause: FindOptionsWhere<Subject> = {};

    // Handle string filters with partial matching
    if (filters.name) {
      where_clause.name = ILike(`%${filters.name}%`);
    }

    if (filters.description) {
      where_clause.description = ILike(`%${filters.description}%`);
    }

    // Handle attachment filters (existence check)
    if (filters.has_icon !== undefined) {
      if (filters.has_icon) {
        where_clause.icon = Not(IsNull());
      } else {
        where_clause.icon = IsNull();
      }
    }

    if (filters.has_banner !== undefined) {
      if (filters.has_banner) {
        where_clause.banner = Not(IsNull());
      } else {
        where_clause.banner = IsNull();
      }
    }

    // Handle enum filters
    if (filters.year_of_study) {
      where_clause.year_of_study = filters.year_of_study;
    }
    if (filters.subject_semestre) {
      where_clause.subject_semestre = filters.subject_semestre;
    }

    // Handle relation filters
    if (filters.unit) {
      where_clause.unit = { id: filters.unit };
    }

    return where_clause;
  }
}
