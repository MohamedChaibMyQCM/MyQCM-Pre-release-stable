import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateReportDto } from "./dto/create-report.dto";
import { UpdateReportDto } from "./dto/update-report.dto";
import { FindOptionsWhere, ILike, In, Repository } from "typeorm";
import { Report } from "./entities/report.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { IReportFilters } from "./type/interface/report-filter.interface";
import { default_offset, default_page } from "shared/constants/pagination";
import { paginate } from "common/utils/return-paginated.util";
import { FileService } from "src/file/file.service";

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly fileService: FileService,
  ) {}
  async create(
    createReportDto: CreateReportDto,
    screenshot_attach: Express.Multer.File,
    userId: string,
  ) {
    let screenshot = null;
    if (screenshot_attach) {
      screenshot = await this.fileService.create(screenshot_attach);
    }
    const report = this.reportRepository.create({
      user: { id: userId },
      ...createReportDto,
      screenshot,
    });
    return this.reportRepository.save(report);
  }

  async findAll(
    filters: IReportFilters = {},
    pagination: PaginationInterface = {
      page: default_page,
      offset: default_offset,
    },
  ) {
    return paginate(
      () =>
        this.reportRepository.findAndCount({
          where: this.generateWhereClauseFromFilters(filters),
          skip: (pagination.page - 1) * pagination.offset,
          take: pagination.offset,
        }),
      pagination,
    );
  }

  findOne(
    params: {
      id: string;
      userId?: string;
    },
    populate?: string[],
  ) {
    return this.reportRepository.findOne({
      where: {
        id: params.id,
        ...(params.userId && { user: { id: params.userId } }),
      },
      relations: populate || [],
    });
  }

  async getOne(
    params: {
      id: string;
      userId?: string;
    },
    populate?: string[],
  ) {
    const report = await this.findOne(params, populate || []);
    if (!report) {
      throw new NotFoundException("Report not found");
    }
    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    const report = await this.getOne({ id });
    const updated = Object.assign(report, updateReportDto);
    return this.reportRepository.save(updated);
  }

  private generateWhereClauseFromFilters(
    filters: IReportFilters = {},
  ): FindOptionsWhere<Report> {
    const where: FindOptionsWhere<Report> = {};

    // Partial title match (ILIKE for case-insensitive search)
    if (filters.title) {
      where.title = ILike(`%${filters.title}%`);
    }

    // Exact match enums
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    // Optional user ID check
    if (filters.user_id) {
      where.user = { id: filters.user_id };
    }

    // Optional support for multiple enums using `IN`
    if (filters.status_in?.length) {
      where.status = In(filters.status_in);
    }

    if (filters.category_in?.length) {
      where.category = In(filters.category_in);
    }

    if (filters.severity_in?.length) {
      where.severity = In(filters.severity_in);
    }

    return where;
  }
}
