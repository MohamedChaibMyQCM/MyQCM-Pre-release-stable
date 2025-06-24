import { Module } from "@nestjs/common";
import { UniversityService } from "./university.service";
import { UniversityController } from "./university.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { University } from "./entities/university.entity";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([University])],
  controllers: [UniversityController],
  providers: [UniversityService],
  exports: [UniversityService],
})
export class UniversityModule {}
