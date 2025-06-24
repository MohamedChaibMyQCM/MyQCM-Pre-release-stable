import { Module } from "@nestjs/common";
import { FormationService } from "./formation.service";
import { FormationController } from "./formation.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FormationEntity } from "./entities/formation.entity";

@Module({
  imports: [TypeOrmModule.forFeature([FormationEntity])],
  controllers: [FormationController],
  providers: [FormationService],
})
export class FormationModule {}
