import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUniversityDto } from "./dto/create-university.dto";
import { UpdateUniversityDto } from "./dto/update-university.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { University } from "./entities/university.entity";
import { Repository } from "typeorm";

@Injectable()
export class UniversityService {
  constructor(
    @InjectRepository(University)
    private readonly universityRepository: Repository<University>,
  ) {}
  async create(
    createUniversityDto: CreateUniversityDto,
    attachment: Express.Multer.File,
  ) {
    if (!attachment) throw new BadRequestException("Attachment not provided");
    const university = this.universityRepository.create({
      ...createUniversityDto,
      attachment: attachment.path,
    });
    return this.universityRepository.save(university);
  }

  async findAll(populate: boolean = false) {
    return this.universityRepository.find({});
  }

  async findOne(universityId: string, populate: boolean = false) {
    const university = await this.universityRepository.findOne({
      where: {
        id: universityId,
      },
    });
    if (!university) throw new NotFoundException("University not found");
    return university;
  }
  async update(universityId: string, updateUniversityDto: UpdateUniversityDto) {
    const university = await this.findOne(universityId);
    Object.assign(university, updateUniversityDto);
    await this.universityRepository.save(university);
    return university;
  }
  async updateAttachment(
    universityId: string,
    attachment: Express.Multer.File,
  ) {
    if (!attachment) throw new NotFoundException("Attachment not provided");
    const university = await this.findOne(universityId);
    university.attachment = attachment.path;
    return this.universityRepository.save(university);
  }
  async remove(universityId: string) {
    const deleted = await this.universityRepository.delete(universityId);
    if (deleted.affected == 0)
      throw new NotFoundException("University not found");
    return true;
  }
}
