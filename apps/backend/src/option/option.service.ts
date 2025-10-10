import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateOptionDto } from "./dto/create-option.dto";
import { UpdateOptionDto } from "./dto/update-option.dto";
import { Option } from "./entities/option.entity";
import { EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Mcq } from "src/mcq/entities/mcq.entity";

@Injectable()
export class OptionService {
  constructor(
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
  ) {}
  async create(
    createOptionDto: CreateOptionDto,
    mcq: Mcq,
    transactionEntityManager?: EntityManager,
  ): Promise<Option> {
    const option = this.optionRepository.create({
      ...createOptionDto,
      mcq,
    });
    const savedOption = transactionEntityManager
      ? await transactionEntityManager.save(Option, option)
      : await this.optionRepository.save(option);
    return savedOption;
  }
  async findOne(optionId: string) {
    const option = await this.optionRepository.findOne({
      where: {
        id: optionId,
      },
    });
    if (!option) throw new NotFoundException("Option not found");
    return option;
  }
  async update(optionId: string, updateOptionDto: UpdateOptionDto) {
    const option = await this.findOne(optionId);
    Object.assign(option, updateOptionDto);
    await this.optionRepository.save(option);
    return option;
  }

  async remove(optionId: string) {
    const deleted = await this.optionRepository.delete(optionId);
    if (deleted.affected == 0) throw new NotFoundException("Option not found");
    return deleted;
  }
}
