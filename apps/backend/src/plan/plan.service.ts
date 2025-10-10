import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreatePlanDto } from "./types/dtos/create-plan.dto";
import { UpdatePlanDto } from "./types/dtos/update-plan.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Plan } from "./entities/plan.entity";
import {
  Between,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { PlanFilters } from "./types/interfaces/plan-filters.interface";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { default_offset, default_page } from "shared/constants/pagination";
import { PaginatedResponse } from "shared/interfaces/paginated.response.interface";

/**
 * Service responsible for managing subscription plans
 */
@Injectable()
export class PlanService {
  /**
   * Creates an instance of PlanService
   * @param planRepository - The TypeORM repository for Plan entity
   */
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  /**
   * Checks if a default plan already exists in the database
   * @returns The default plan if found, otherwise null
   * @private
   */
  private async checkIfDefaultPlanExists() {
    return this.planRepository.findOne({
      where: { is_default: true },
      select: ["id"],
    });
  }

  /**
   * Checks if a plan with the given name already exists
   * @param name - The plan name to check
   * @returns The plan with the given name if found, otherwise null
   * @private
   */
  private async checkIfPlanNameExists(name: string) {
    return this.planRepository.findOne({
      where: { name },
      select: ["id"],
    });
  }

  /**
   * Creates a new subscription plan
   * @param createPlanDto - Data for creating a new plan
   * @throws {ConflictException} When a default plan already exists or plan name is already in use
   * @returns The newly created plan
   */
  async createNewPlan(createPlanDto: CreatePlanDto): Promise<Plan> {
    if (createPlanDto.is_default) {
      if (await this.checkIfDefaultPlanExists()) {
        throw new ConflictException("Default plan already exists");
      }
    }
    if (await this.checkIfPlanNameExists(createPlanDto.name)) {
      throw new ConflictException("Plan name already exists");
    }

    const plan = this.planRepository.create(createPlanDto);
    return this.planRepository.save(plan);
  }

  /**
   * Retrieves plans with pagination and filtering
   * @param filters - Optional filters to apply to the query
   * @param pagination - Pagination parameters
   * @returns Paginated list of plans matching the criteria
   */
  async findPlansPaginated(
    filters: PlanFilters = {},
    pagination: PaginationInterface = {
      page: default_page,
      offset: default_offset,
    },
  ): Promise<PaginatedResponse<Plan>> {
    const [plans, total] = await this.planRepository.findAndCount({
      where: this.generateWhereClauseFromFilters(filters),
      skip: (pagination.page - 1) * pagination.offset,
      take: pagination.offset,
    });
    return {
      data: plans,
      total,
      page: pagination.page,
      offset: pagination.offset,
      total_pages: Math.ceil(total / pagination.offset),
    };
  }

  /**
   * Finds a single plan based on ID and/or other filters
   * @param params - Object containing optional planId
   * @param filters - Additional filters to apply
   * @returns The plan if found, otherwise null
   */
  async findPlan(params: { planId?: string }, filters: PlanFilters = {}) {
    return this.planRepository.findOne({
      where: {
        ...(params.planId ? { id: params.planId } : {}),
        ...this.generateWhereClauseFromFilters(filters),
      },
    });
  }

  /**
   * Retrieves a plan by its ID
   * @param planId - The ID of the plan to retrieve
   * @throws {NotFoundException} When plan with the given ID is not found
   * @returns The plan with the specified ID
   */
  async getPlanById(planId: string): Promise<Plan> {
    const plan = await this.findPlan({ planId });
    if (!plan) {
      throw new NotFoundException("Plan not found");
    }
    return plan;
  }

  /**
   * Retrieves the default plan
   * @throws {NotFoundException} When no default plan exists
   * @returns The default plan
   */
  async getDefaultPlan(): Promise<Plan> {
    const default_plan = await this.findPlan({}, { is_default: true });
    if (!default_plan) {
      throw new NotFoundException("Default plan not found");
    }
    return default_plan;
  }

  /**
   * Updates an existing plan by ID
   * @param id - The ID of the plan to update
   * @param updatePlanDto - The data to update the plan with
   * @throws {NotFoundException} When plan with the given ID is not found
   * @throws {ConflictException} When trying to set a plan as default when another default exists
   *                             or when trying to use a name that already exists
   * @returns The updated plan
   */
  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.getPlanById(id);
    if (!plan) {
      throw new NotFoundException("Plan not found");
    }

    // Check if attempting to update name to an existing name
    if (updatePlanDto.name && updatePlanDto.name !== plan.name) {
      const existingPlan = await this.checkIfPlanNameExists(updatePlanDto.name);
      if (existingPlan) {
        throw new ConflictException("Plan name already exists");
      }
    }

    // Handle default plan logic
    if (updatePlanDto.is_default) {
      const defaultPlan = await this.checkIfDefaultPlanExists();
      if (defaultPlan && defaultPlan.id !== id) {
        throw new ConflictException("Default plan already exists");
      }
    }

    const updatedPlan = Object.assign(plan, updatePlanDto);
    return this.planRepository.save(updatedPlan);
  }

  /**
   * Removes a plan by ID
   * @param id - The ID of the plan to remove
   * @throws {NotFoundException} When plan with the given ID is not found
   * @returns True if the plan was successfully deleted
   */
  async remove(id: string): Promise<boolean> {
    const deleted = await this.planRepository.delete({ id });

    if (deleted.affected === 0) {
      throw new NotFoundException("Plan not found");
    }
    return true;
  }
  /**
   * Generates a TypeORM where clause based on the provided filters
   * @param filters - The filters to apply to the query
   * @returns A TypeORM compatible where clause object
   * @private
   */
  private generateWhereClauseFromFilters(filters: PlanFilters = {}) {
    let where_clause: FindOptionsWhere<Plan> = {};

    // Handle string filters
    if (filters.name) {
      where_clause.name = ILike(`%${filters.name}%`);
    }

    // Handle boolean filters
    if (filters.is_default !== undefined) {
      where_clause.is_default = filters.is_default;
    }

    if (filters.period !== undefined) {
      where_clause.period = filters.period;
    }

    // Handle numeric range filters
    const number_filters = ["price", "mcqs", "qrocs", "devices"];

    for (const field of number_filters) {
      const min_value = filters[`${field}_min`];
      const max_value = filters[`${field}_max`];

      // Only add conditions if min or max values are valid numbers
      if (
        min_value !== undefined &&
        max_value !== undefined &&
        !isNaN(Number(min_value)) &&
        !isNaN(Number(max_value))
      ) {
        where_clause[field] = Between(Number(min_value), Number(max_value));
      } else if (min_value !== undefined && !isNaN(Number(min_value))) {
        where_clause[field] = MoreThanOrEqual(Number(min_value));
      } else if (max_value !== undefined && !isNaN(Number(max_value))) {
        where_clause[field] = LessThanOrEqual(Number(max_value));
      }
      // Don't add any condition if the values are not valid numbers
    }

    // Handle boolean feature filters
    const boolean_filters = ["explanations", "notifications", "analysis"];

    for (const field of boolean_filters) {
      if (filters[field] !== undefined) {
        where_clause[field] = filters[field];
      }
    }
    return where_clause;
  }
}
