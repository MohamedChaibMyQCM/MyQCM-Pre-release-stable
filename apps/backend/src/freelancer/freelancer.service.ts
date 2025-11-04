import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UpdateFreelancerDto } from "./dto/update-freelancer.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Freelancer } from "./entities/freelancer.entity";
import { In, Repository } from "typeorm";
import {
  SigninFreelancerByCodeDto,
  SigninFreelancerDto,
} from "./dto/signin-freelancer.dto";
import { UpdateFreelancerPasswordDto } from "./dto/update-Freelancer-Password.dto";
import { UpdateFreelancerEmailDto } from "./dto/update-freelancer-email.dto";
import { WalletService } from "src/wallet/wallet.service";
import { SignupFreelancerDto } from "./dto/create-freelancer.dto";
import { hashString, verifyHash } from "common/utils/hashing";
@Injectable()
export class FreelancerService {
  constructor(
    @InjectRepository(Freelancer)
    private readonly freelancerRepository: Repository<Freelancer>,
    private readonly walletService: WalletService,
  ) {}
  async checkEmailExists(email: string): Promise<boolean> {
    const freelancer = await this.freelancerRepository.findOne({
      where: { email },
      select: ["id"],
    });
    return !!freelancer;
  }
  async checkCodeExists(code: string): Promise<boolean> {
    const code_obj = await this.freelancerRepository.findOne({
      where: { code },
      select: ["id"],
    });
    return !!code_obj;
  }
  async findOneById(freelancerId: string) {
    const freelancer = await this.freelancerRepository.findOne({
      where: {
        id: freelancerId,
      },
    });
    return freelancer;
  }
  async getOneById(freelancerId: string) {
    const freelancer = await this.findOneById(freelancerId);
    if (!freelancer) {
      throw new NotFoundException("Freelancer not found");
    }
    return freelancer;
  }
  async getDatabaseCurrentTime(): Promise<Date> {
    const result = await this.freelancerRepository.query("SELECT NOW()");
    const databaseTime = new Date(result[0].now); // This is in UTC
    return databaseTime;
  }

  async getTopFreelancersOfDay(date_string: string) {
    const currentDate = date_string || (await this.getDatabaseCurrentTime());

    const startOfDay = new Date(currentDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(currentDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const topFreelancers = await this.freelancerRepository
      .createQueryBuilder("freelancer")
      .select("freelancer.id", "id")
      .addSelect("freelancer.name", "name")
      .addSelect("freelancer.email", "email")
      .addSelect("freelancer.image", "image")
      .addSelect(
        `(SELECT COUNT(mcq.id) FROM mcq WHERE mcq."freelancerId" = freelancer.id AND mcq.in_clinical_case = false AND mcq."createdAt" BETWEEN :startOfDay AND :endOfDay)`,
        "mcq_count",
      )
      .addSelect(
        `(SELECT COUNT(clinical_case.id) FROM clinical_case WHERE clinical_case."freelancerId" = freelancer.id AND clinical_case."createdAt" BETWEEN :startOfDay AND :endOfDay)`,
        "clinical_case_count",
      )
      .addSelect(
        `((SELECT COUNT(mcq.id) FROM mcq WHERE mcq."freelancerId" = freelancer.id AND mcq.in_clinical_case = false AND mcq."createdAt" BETWEEN :startOfDay AND :endOfDay) + 
      (SELECT COUNT(clinical_case.id) FROM clinical_case WHERE clinical_case."freelancerId" = freelancer.id AND clinical_case."createdAt" BETWEEN :startOfDay AND :endOfDay))`,
        "total_count",
      )
      .groupBy("freelancer.id")
      .orderBy("total_count", "DESC")
      .limit(5)
      .setParameters({ startOfDay, endOfDay })
      .getRawMany();

    return topFreelancers.filter((freelancer) => freelancer.total_count > 0);
  }
  async findFreelancersByIds(freelancerIds: any[]): Promise<Freelancer[]> {
    return await this.freelancerRepository.findBy({
      id: In(freelancerIds),
    });
  }
  async findFreelancerByEmail(email: string) {
    return await this.freelancerRepository
      .createQueryBuilder("freelancer")
      .where("freelancer.email = :email", { email })
      .addSelect("freelancer.password") // Explicitly select the password
      .getOne();
  }
  async findFreelancerWithPassword(freelancerId: string) {
    return await this.freelancerRepository
      .createQueryBuilder("freelancer")
      .where("freelancer.id = :freelancerId", { freelancerId })
      .addSelect("freelancer.password") // Explicitly select the password
      .getOne();
  }
  async create(signupFreelancerDto: SignupFreelancerDto): Promise<Freelancer> {
    const { email, code } = signupFreelancerDto;
    if (await this.checkEmailExists(email))
      throw new ConflictException("Email already taken");
    if (code && (await this.checkCodeExists(code)))
      throw new ConflictException("Code already taken");
    return this.freelancerRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const freelancer = this.freelancerRepository.create({
          ...signupFreelancerDto,
          password: await hashString(signupFreelancerDto.password),
        });
        await transactionalEntityManager.save(freelancer);
        await this.walletService.initWallet(
          freelancer,
          transactionalEntityManager,
        );
        return freelancer;
      },
    );
  }
  async signin(signinFreelancerDto: SigninFreelancerDto): Promise<Freelancer> {
    const { email, password } = signinFreelancerDto;
    const freelancer = await this.findFreelancerByEmail(email);
    if (!freelancer) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const isPasswordValid = await verifyHash(password, freelancer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return freelancer;
  }
  async signinByCode(signinFreelancerByCodeDto: SigninFreelancerByCodeDto) {
    const freelancer = await this.freelancerRepository.findOne({
      where: {
        code: signinFreelancerByCodeDto.code,
      },
    });
    if (!freelancer) throw new UnauthorizedException("Invalid code");
    return freelancer;
  }

  async update(
    freelancer: Freelancer,
    updateFreelancerDto: UpdateFreelancerDto,
  ) {
    Object.assign(freelancer, updateFreelancerDto);
    await this.freelancerRepository.save(freelancer);
    return freelancer;
  }
  async updatePassword(
    freelancerId: string,
    updateFreelancerPasswordDto: UpdateFreelancerPasswordDto,
  ) {
    const freelancer = await this.findFreelancerWithPassword(freelancerId);
    if (!freelancer) throw new UnauthorizedException("Freelancer not Found");
    const old_password_valid = await verifyHash(
      updateFreelancerPasswordDto.old_password,
      freelancer.password,
    );
    if (!old_password_valid) {
      throw new ConflictException("old password not correct");
    }
    freelancer.password = updateFreelancerPasswordDto.new_password;
    await this.freelancerRepository.save(freelancer);
    return freelancer;
  }
  async updateImage(freelancer: Freelancer, image: Express.Multer.File) {
    if (!image) throw new ConflictException("Image not provided");
    freelancer.image = image.path;
    await this.freelancerRepository.save(freelancer);
    return freelancer;
  }
  async updateEmail(
    freelancerId: string,
    updateFreelancerEmailDto: UpdateFreelancerEmailDto,
  ) {
    const freelancer = await this.findFreelancerWithPassword(freelancerId);
    if (!freelancer) {
      throw new UnauthorizedException("Freelancer not found");
    }
    if (freelancer.email == updateFreelancerEmailDto.new_email)
      throw new ConflictException("This is your current email");

    const password_valid = await verifyHash(
      updateFreelancerEmailDto.password,
      freelancer.password,
    );

    if (!password_valid) {
      throw new ConflictException("password not correct");
    }

    const emailExists = await this.findFreelancerByEmail(
      updateFreelancerEmailDto.new_email,
    );

    if (emailExists && emailExists.id !== freelancerId) {
      throw new ConflictException("Email already taken");
    }

    // Update the freelancer's email and save
    freelancer.email = updateFreelancerEmailDto.new_email;
    freelancer.password = undefined;
    await this.freelancerRepository.save(freelancer);

    return freelancer;
  }

  async remove(freelancer: Freelancer) {
    const deleted = await this.freelancerRepository.remove(freelancer);
    return true;
  }
}
