import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, ILike, IsNull, Not, Repository } from "typeorm";
import { CreateCourseDto } from "./types/dto/create-course.dto";
import { UpdateCourseDto } from "./types/dto/update-course.dto";
import { Course } from "./entities/course.entity";
import { ProgressService } from "src/progress/progress.service";
import { McqService } from "src/mcq/mcq.service";
import { CourseFilters } from "./types/interfaces/course-filters.interface";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { default_offset, default_page } from "shared/constants/pagination";

/**
 * Service responsible for managing course-related operations
 */
@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly progressService: ProgressService,
    private readonly mcqService: McqService,
  ) {}

  /**
   * Checks if a course with the given name already exists in a specific subject
   *
   * @param name - The name of the course to check
   * @param subject - The ID of the subject to check within
   * @returns {Promise<boolean>} True if a course with the given name exists in the subject, false otherwise
   */
  async courseNameForSubjectExists(name: string, subject: string) {
    const course = await this.courseRepository.findOne({
      where: {
        name,
        subject: {
          id: subject,
        },
      },
      select: ["id"],
    });
    return !!course;
  }

  /**
   * Creates a new course with the given DTO and attachment
   *
   * @param createCourseDto - The data transfer object containing course details
   * @param attachment - The file uploaded as an attachment for the course
   * @returns Promise resolving to the newly created Course entity
   * @throws {NotFoundException} When attachment is not provided
   * @throws {BadRequestException} When a course with the same name already exists in the subject
   */
  async create(
    createCourseDto: CreateCourseDto,
    attachment: Express.Multer.File,
  ): Promise<Course> {
    if (!attachment) throw new NotFoundException("Attachment not provided");
    const { name, subject } = createCourseDto;
    if (await this.courseNameForSubjectExists(name, subject)) {
      throw new BadRequestException(
        "Course with this name already exists in this subject",
      );
    }
    const course = this.courseRepository.create({
      ...createCourseDto,
      subject: { id: subject },
      attachment: attachment.path,
    });
    return this.courseRepository.save(course);
  }

  /**
   * Retrieves courses with pagination according to specified filters.
   *
   * @param filters - The criteria to filter courses
   * @param pagination - Pagination parameters
   *
   * @returns A paginated result object containing:
   *   - data: Array of course entities matching the filters
   *   - total: Total number of courses matching the filters
   *   - page: Current page number
   *   - offset: Number of items per page
   *   - total_pages: Total number of pages available
   */
  async findCoursesPaginated(
    filters: CourseFilters = {},
    pagination: PaginationInterface = {
      page: default_page,
      offset: default_offset,
    },
  ) {
    const [courses, total] = await this.courseRepository.findAndCount({
      where: this.generateWhereClauseFromFilters(filters),
      skip: (pagination.page - 1) * pagination.offset,
      take: pagination.offset,
    });
    return {
      data: courses,
      total,
      page: pagination.page,
      offset: pagination.offset,
      total_pages: Math.ceil(total / pagination.offset),
    };
  }

  /**
   * Retrieves paginated courses for a specific user filtered by subject with their progress information.
   *
   * @param userId - The ID of the user to get courses for
   * @param filters - Filtering criteria for courses, must contain a subject ID
   * @param pagination - Pagination parameters with default values
   * @returns An object containing:
   *   - data: Array of courses with added progress information
   *   - total: Total number of courses matching the filters
   *   - page: Current page number
   *   - offset: Number of items per page
   *   - total_pages: Total number of pages
   * @throws {BadRequestException} When no subject is provided in filters
   *
   * @example
   * // Get first page of user courses for a specific subject
   * const result = await courseService.getUserCoursesBySubjectPaginated(
   *   '123abc',
   *   { subject: 'math-101' },
   *   { page: 1, offset: 10 }
   * );
   */
  async getUserCoursesBySubjectPaginated(
    userId: string,
    filters: CourseFilters, // this will contain the subjectId
    pagination: PaginationInterface = {
      page: default_page,
      offset: default_offset,
    },
  ) {
    if (!filters.subject) {
      throw new BadRequestException("No subject were provided");
    }
    const {
      data: courses,
      total,
      total_pages,
    } = await this.findCoursesPaginated(filters, pagination);
    const courses_ids = courses.map((course) => course.id);

    const [user_progress_count, course_mcq_count] = await Promise.all([
      // Get progress data (how many MCQs the user has attempted per course)
      await this.progressService.countMcqsProgressByMultipleFilters(
        {
          user: userId,
          courses: courses_ids,
        },
        {
          distinct: true,
        },
      ),

      // Get total MCQ counts per course
      await this.mcqService.countMcqsByMultipleFilters({
        courses: courses_ids,
      }),
    ]);

    const progress_map = new Map(
      user_progress_count.map((item) => [item.courseId, item.count]),
    );

    const mcq_count_map = new Map(
      course_mcq_count.map((item) => [item.courseId, item.count]),
    );

    const final_courses = courses.map((course) => {
      const attempted = progress_map.get(course.id) || 0;
      const total = mcq_count_map.get(course.id) || 0;

      return {
        ...course,
        attempted,
        total,
        progress_percentage:
          total > 0 ? Math.floor((attempted / total) * 100) : 0,
      };
    });
    return {
      data: final_courses,
      total,
      page: pagination.page,
      offset: pagination.offset,
      total_pages,
    };
  }

  /**
   * Fetches a course from the database by its unique identifier.
   *
   * @param {string} id - The unique identifier of the course to find
   * @returns {Promise<Course>} A promise that resolves to the course object if found, otherwise null
   */
  async findCourseById(id: string) {
    return this.courseRepository.findOneBy({ id });
  }

  /**
   * Retrieves a course by its ID.
   *
   * @param courseId - The unique identifier of the course to retrieve
   * @returns {Promise<Course>} The course entity if found
   * @throws {NotFoundException} If the course with the given ID doesn't exist
   */
  async getCourseById(courseId: string) {
    const course = await this.findCourseById(courseId);
    if (!course) {
      throw new NotFoundException("Course was not found");
    }
    return course;
  }

  /**
   * Updates a course with the provided data
   *
   * @param courseId - The ID of the course to update
   * @param updateCourseDto - Data transfer object containing properties to update
   * @returns {Promise<boolean>} True if the update was successful
   * @throws {NotFoundException} If the course with the given ID doesn't exist
   */
  async updateCourse(
    courseId: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<boolean> {
    const { subject, ...cleanedUpdateObject } = updateCourseDto;
    let finaleUpdateObject: any = cleanedUpdateObject;
    if (subject) {
      finaleUpdateObject.subject = { id: subject };
    }
    const updated = await this.courseRepository.update(
      courseId,
      finaleUpdateObject,
    );
    if (updated.affected === 0) {
      throw new NotFoundException("Course not found");
    }
    return true;
  }

  /**
   * Updates the attachment file for a course
   *
   * @param courseId - The ID of the course to update
   * @param attachment - The new file to attach to the course
   * @returns {Promise<boolean>} True if the update was successful
   * @throws {NotFoundException} If the attachment is not provided or the course is not found
   */
  async updateAttachment(
    courseId: string,
    attachment: Express.Multer.File,
  ): Promise<boolean> {
    if (!attachment) throw new NotFoundException("Attachment not provided");
    return this.updateCourse(courseId, { attachment: attachment.path });
  }

  /**
   * Removes a course from the database
   *
   * @param courseId - The ID of the course to remove
   * @returns {Promise<boolean>} True if the removal was successful
   * @throws {NotFoundException} If the course with the given ID doesn't exist
   */
  async removeCourse(courseId: string): Promise<boolean> {
    const result = await this.courseRepository.delete(courseId);
    if (result.affected === 0) {
      throw new NotFoundException("Course not found");
    }
    return true;
  }

  /**
   * Generates a TypeORM where clause from the provided filters for Course queries.
   *
   * @param {CourseFilters} filters - The filters to apply to the query
   * @returns {FindOptionsWhere<Course>} The TypeORM where clause object
   */
  private generateWhereClauseFromFilters(
    filters: CourseFilters = {},
  ): FindOptionsWhere<Course> {
    let where_clause: FindOptionsWhere<Course> = {};

    // Handle string filters with partial matching
    if (filters.name) {
      where_clause.name = ILike(`%${filters.name}%`);
    }

    if (filters.description) {
      where_clause.description = ILike(`%${filters.description}%`);
    }

    // Handle attachment filter (existence check)
    if (filters.has_attachment !== undefined) {
      if (filters.has_attachment) {
        where_clause.attachment = Not(IsNull());
      } else {
        where_clause.attachment = IsNull();
      }
    }

    // Handle relation filters
    if (filters.subject) {
      where_clause.subject = { id: filters.subject };
    }

    return where_clause;
  }
}
