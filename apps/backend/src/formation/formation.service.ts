import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateFormationDto } from "./dto/create-formation.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FormationEntity } from "./entities/formation.entity";

@Injectable()
export class FormationService {
  constructor(
    @InjectRepository(FormationEntity)
    private readonly formationRepository: Repository<FormationEntity>,
  ) {}

  async emailExist(email: string) {
    const email_count = await this.formationRepository.count({
      where: {
        email: email,
      },
    });
    return email_count > 0;
  }

  async create(createFormationDTO: CreateFormationDto) {
    if (await this.emailExist(createFormationDTO.email))
      throw new ConflictException("Email user in Formation list");
    const FormationList = this.formationRepository.create(createFormationDTO);
    return this.formationRepository.save(FormationList);
  }

  async findAll(limit: number = 20, page: number = 1) {
    const [Formation_list, total] = await this.formationRepository.findAndCount(
      {
        take: limit,
        skip: (page - 1) * limit,
      },
    );
    return {
      Formation_list,
      total,
      page: page,
      total_page: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const userRegister = await this.formationRepository.findOne({
      where: {
        id,
      },
    });
    if (!userRegister) throw new NotFoundException("user not found");
    return userRegister;
  }
}
