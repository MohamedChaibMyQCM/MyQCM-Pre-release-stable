import { Module } from "@nestjs/common";
import { FreelancerService } from "./freelancer.service";
import { FreelancerController } from "./freelancer.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Freelancer } from "./entities/freelancer.entity";
import { WalletModule } from "src/wallet/wallet.module";
import { GenerationRequest } from "src/generation/entities/generation-request.entity";
import { GenerationItem } from "src/generation/entities/generation-item.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Freelancer, GenerationRequest, GenerationItem]),
    WalletModule,
  ],
  controllers: [FreelancerController],
  providers: [FreelancerService],
  exports: [FreelancerService],
})
export class FreelancerModule {}
