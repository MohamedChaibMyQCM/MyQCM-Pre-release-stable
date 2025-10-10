import { Module } from "@nestjs/common";
import { ModeService } from "./mode.service";
import { ModeController } from "./mode.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Mode } from "./entities/mode.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Mode])],
  controllers: [ModeController],
  providers: [ModeService],
  exports: [ModeService],
})
export class ModeModule {}
