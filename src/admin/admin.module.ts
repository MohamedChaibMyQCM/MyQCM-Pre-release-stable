import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Admin } from "./entities/admin.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  //controllers: [AdminController], working with admin js for now
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
