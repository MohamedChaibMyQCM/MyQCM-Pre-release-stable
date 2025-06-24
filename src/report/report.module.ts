import { Module } from "@nestjs/common";
import { ReportService } from "./report.service";
import { ReportController } from "./report.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Report } from "./entities/report.entity";
import { FileModule } from "src/file/file.module";

@Module({
  imports: [TypeOrmModule.forFeature([Report]), FileModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
