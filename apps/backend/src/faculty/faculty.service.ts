import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateFacultyDto } from "./types/dtos/create-faculty.dto";
import { UpdateFacultyDto } from "./types/dtos/update-faculty.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Faculty } from "./entities/faculty.entity";
import { Repository } from "typeorm";
import { UniversityService } from "src/university/university.service";

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
    private readonly universityService: UniversityService,
  ) {}

  async create(
    createFacultyDto: CreateFacultyDto,
    attachment: Express.Multer.File,
  ) {
    if (!attachment) throw new BadRequestException("Attachment not provided");
    const university = await this.universityService.findOne(
      createFacultyDto.university,
    );
    const faculty = this.facultyRepository.create({
      ...createFacultyDto,
      university,
      attachment: attachment.path,
    });
    return this.facultyRepository.save(faculty);
  }

  async findAll(universityId: string) {
    let queries: any = {};
    if (universityId) queries.university = { id: universityId };
    return this.facultyRepository.find({
      where: {
        ...queries,
      },
    });
  }

  async findOne(facultyId: string) {
    const faculty = await this.facultyRepository.findOne({
      where: {
        id: facultyId,
      },
    });
    if (!faculty) throw new NotFoundException("Faculty not found");
    return faculty;
  }

  async update(facultyId: string, updateFacultyDto: UpdateFacultyDto) {
    const faculty = await this.findOne(facultyId);
    Object.assign(faculty, updateFacultyDto);
    return this.facultyRepository.save(faculty);
  }
  async updateAttachment(facultyId: string, attachment: Express.Multer.File) {
    if (!attachment) throw new NotFoundException("Attachment not provided");
    const faculty = await this.findOne(facultyId);
    faculty.attachment = attachment.path;
    return this.facultyRepository.save(faculty);
  }

  async remove(facultyId: string) {
    const deleted = await this.facultyRepository.delete(facultyId);
    if (deleted.affected == 0) throw new NotFoundException("Faculty not found");
    return true;
  }
}
