import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Admin } from "./entities/admin.entity";
import { Repository } from "typeorm";
import { SigninAdminDto } from "./dto/signin-admin.dto";
import { hashString, verifyHash } from "common/utils/hashing";
import { AdminScope } from "./enums/admin-scope.enum";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}
  async getAdminById(id: string) {
    const admin = await this.adminRepository.findOneBy({ id });
    if (!admin) throw new UnauthorizedException("Admin not found");
    return admin;
  }
  async findAdminByEmail(email: string) {
    return this.adminRepository
      .createQueryBuilder("admin")
      .where("admin.email = :email", { email })
      .addSelect("admin.password") // Include the password field
      .getOne();
  }
  async emailExists(email: string): Promise<boolean> {
    const admin = await this.adminRepository.findOne({ where: { email } });
    return !!admin;
  }

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    if (await this.emailExists(createAdminDto.email)) {
      throw new ConflictException("Email already taken");
    }
    const admin = this.adminRepository.create({
      ...createAdminDto,
      password: await hashString(createAdminDto.password),
      scopes: createAdminDto.scopes?.length
        ? createAdminDto.scopes
        : [AdminScope.SUPER],
    });
    await this.adminRepository.save(admin);
    return admin;
  }

  async signin(signinAdminDto: SigninAdminDto): Promise<Admin> {
    const { email, password } = signinAdminDto;
    const admin = await this.findAdminByEmail(email);
    if (!admin) throw new ConflictException("Invalid credentials");
    const isPasswordMatch = await verifyHash(password, admin.password);
    if (!isPasswordMatch) throw new ConflictException("Invalid credentials");
    return admin;
  }

  /*async update(id: number, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.findOne(id);
    if (updateAdminDto.email && updateAdminDto.email !== admin.email) {
      if (await this.emailExists(updateAdminDto.email)) {
        throw new ConflictException('Email already taken');
      }
    }
    Object.assign(admin, updateAdminDto);
    return this.adminRepository.save(admin);
  }

  async remove(id: number): Promise<void> {
    const result = await this.adminRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
  }*/
}
