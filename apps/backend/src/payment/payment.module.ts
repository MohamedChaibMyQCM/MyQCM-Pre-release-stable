import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { PlanModule } from "src/plan/plan.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "./entities/payment.entity";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), PlanModule, UserModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
