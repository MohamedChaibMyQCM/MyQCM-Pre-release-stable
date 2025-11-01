import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RewardCategory } from "../entities/reward-category.entity";
import { CreateRewardCategoryDto } from "../dto/create-reward-category.dto";
import { UpdateRewardCategoryDto } from "../dto/update-reward-category.dto";

@Injectable()
export class RewardCategoryService {
  constructor(
    @InjectRepository(RewardCategory)
    private readonly categoryRepository: Repository<RewardCategory>,
  ) {}

  async create(createDto: CreateRewardCategoryDto) {
    const existing = await this.categoryRepository.findOne({
      where: [{ slug: createDto.slug }, { name: createDto.name }],
    });
    if (existing) {
      throw new ConflictException("Category with same slug or name exists");
    }

    const category = this.categoryRepository.create({
      ...createDto,
    });
    return this.categoryRepository.save(category);
  }

  async findAll(options?: { includeInactive?: boolean }) {
    const where = options?.includeInactive ? {} : { isActive: true };
    return this.categoryRepository.find({
      where,
      order: { sortOrder: "ASC", name: "ASC" },
    });
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException("Reward category not found");
    }
    return category;
  }

  async update(id: string, updateDto: UpdateRewardCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, updateDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    return { deleted: true };
  }
}
