import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateModeDto } from "./types/dtos/create-mode.dto";
import { UpdateModeDto } from "./types/dtos/update-mode.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Mode } from "./entities/mode.entity";
import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { ModeFilters } from "./types/interfaces/mode-filter.interface";
import { default_offset, default_page } from "shared/constants/pagination";
import { PaginatedResponse } from "shared/interfaces/paginated.response.interface";
import { PaginationInterface } from "shared/interfaces/pagination.interface";

/**
 * Service responsible for managing Mode entities in the application.
 *
 * Provides functionality for creating, retrieving, updating, and deleting modes,
 * including handling of default modes and paginated queries with filtering.
 */
@Injectable()
export class ModeService {
  /**
   * Creates an instance of ModeService.
   * @param {Repository<Mode>} modeRepository - The repository for Mode entities
   */
  constructor(
    @InjectRepository(Mode)
    private readonly modeRepository: Repository<Mode>,
  ) {}

  /**
   * Creates a new mode entity with the provided data.
   *
   * @param {CreateModeDto} createModeDto - The data to create the new mode
   * @returns {Promise<Mode>} The newly created mode entity
   */
  async createNewMode(createModeDto: CreateModeDto): Promise<Mode> {
    const mode = this.modeRepository.create(createModeDto);
    return this.modeRepository.save(mode);
  }

  /**
   * Retrieves modes with pagination and filtering.
   *
   * @param {ModeFilters} filters - Optional filters to apply to the query
   * @param {PaginationInterface} pagination - Pagination parameters
   * @returns {Promise<PaginatedResponse<Mode>>} Paginated list of modes matching the criteria
   */
  async findModesPaginated(
    filters: ModeFilters = {},
    pagination: PaginationInterface = {
      page: default_page,
      offset: default_offset,
    },
  ): Promise<PaginatedResponse<Mode>> {
    const [modes, total] = await this.modeRepository.findAndCount({
      where: this.generateWhereClauseFromFilters(filters),
      skip: (pagination.page - 1) * pagination.offset,
      take: pagination.offset,
      order: {
        createdAt: "DESC",
      },
    });

    return {
      data: modes,
      total,
      page: pagination.page,
      offset: pagination.offset,
      total_pages: Math.ceil(total / pagination.offset),
    };
  }

  /**
   * Finds a mode by its unique identifier.
   *
   * @param {string} id - The unique identifier of the mode
   * @returns {Promise<Mode | null>} The found mode entity or null if not found
   */
  async findOneById(id: string): Promise<Mode | null> {
    return this.modeRepository.findOneBy({ id });
  }

  /**
   * Gets a mode by ID or throws a NotFoundException if not found.
   *
   * @param {string} id - The unique identifier of the mode to retrieve
   * @returns {Promise<Mode>} The found mode entity
   * @throws {NotFoundException} If the mode with the given ID is not found
   */
  async getModeById(id: string): Promise<Mode> {
    const mode = await this.findOneById(id);
    if (!mode) {
      throw new NotFoundException(`Mode with ID '${id}' not found`);
    }
    return mode;
  }

  /**
   * Updates a mode with the provided data.
   *
   * @param {string} id - The unique identifier of the mode to update
   * @param {UpdateModeDto} updateModeDto - The data to update the mode with
   * @returns {Promise<boolean>} True if update was successful
   * @throws {NotFoundException} If the mode with the given ID is not found
   */
  async update(id: string, updateModeDto: UpdateModeDto): Promise<boolean> {
    await this.getModeById(id);

    const updated = await this.modeRepository.update(id, updateModeDto);

    if (updated.affected === 0) {
      throw new NotFoundException(`Failed to update mode with ID '${id}'`);
    }

    return true;
  }

  /**
   * Removes a mode by its ID.
   *
   * @param {string} id - The unique identifier of the mode to remove
   * @returns {Promise<boolean>} True if removal was successful
   * @throws {NotFoundException} If the mode with the given ID is not found
   */
  async remove(id: string): Promise<boolean> {
    // Prevent deletion of default mode
    const deleted = await this.modeRepository.delete({ id });

    if (deleted.affected === 0) {
      throw new NotFoundException(`Failed to delete mode with ID '${id}'`);
    }

    return true;
  }

  /**
   * Generates a TypeORM where clause based on the provided filters.
   *
   * @param {ModeFilters} filters - The filters to apply to the query
   * @returns {FindOptionsWhere<Mode>} A TypeORM compatible where clause object
   * @private
   */
  private generateWhereClauseFromFilters(
    filters: ModeFilters = {},
  ): FindOptionsWhere<Mode> {
    const where_clause: FindOptionsWhere<Mode> = {};

    // Handle string filters with trimming to prevent matching on whitespace
    if (filters.name) {
      where_clause.name = ILike(`%${filters.name.trim()}%`);
    }

    // Handle enum filters using a more maintainable approach
    const enum_filters = [
      "include_qcm_definer",
      "include_qcs_definer",
      "include_qroc_definer",
      "time_limit_definer",
      "number_of_questions_definer",
      "randomize_questions_order_definer",
      "randomize_options_order_definer",
    ];

    for (const field of enum_filters) {
      if (filters[field] !== undefined) {
        where_clause[field] = filters[field];
      }
    }

    return where_clause;
  }
}
