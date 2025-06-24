import { Module } from "@nestjs/common";
import { UnitService } from "./unit.service";
import { UnitController } from "./unit.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Unit } from "./entities/unit.entity";
import { UserModule } from "src/user/user.module";
import { ProgressModule } from "src/progress/progress.module";
import { McqModule } from "src/mcq/mcq.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Unit]),
    UserModule,
    ProgressModule,
    McqModule,
  ],
  controllers: [UnitController],
  providers: [UnitService],
  exports: [UnitService],
})
export class UnitModule {}
