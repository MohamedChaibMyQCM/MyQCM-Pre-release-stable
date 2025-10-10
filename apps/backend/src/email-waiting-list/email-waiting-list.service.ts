import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateEmailWaitingListDto } from "./dto/create-email-waiting-list.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { EmailWaitingList } from "./entities/email-waiting-list.entity";
import { Repository } from "typeorm";

@Injectable()
export class EmailWaitingListService {
  constructor(
    @InjectRepository(EmailWaitingList)
    private readonly emailWaitingListRepository: Repository<EmailWaitingList>,
  ) {}

  async emailExist(email: string) {
    const email_count = await this.emailWaitingListRepository.count({
      where: {
        email: email,
      },
    });
    return email_count > 0;
  }

  async create(createEmailWaitingListDto: CreateEmailWaitingListDto) {
    if (await this.emailExist(createEmailWaitingListDto.email))
      throw new ConflictException("Email already in waiting list");
    const emailWaitingList = this.emailWaitingListRepository.create(
      createEmailWaitingListDto,
    );
    return this.emailWaitingListRepository.save(emailWaitingList);
  }

  async findAll(limit: number = 20, page: number = 1) {
    const [waiting_list, total] =
      await this.emailWaitingListRepository.findAndCount({
        take: limit,
        skip: (page - 1) * limit,
      });
    return {
      waiting_list,
      total,
      page: page,
      total_page: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const email = await this.emailWaitingListRepository.findOne({
      where: {
        id,
      },
    });
    if (!email) throw new NotFoundException("Email not found");
    return email;
  }
}
