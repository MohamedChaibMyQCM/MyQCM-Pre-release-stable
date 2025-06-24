import { Module } from "@nestjs/common";
import { ActivationCardService } from "./activation-card.service";
import { ActivationCardController } from "./activation-card.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivationCard } from "./entities/activation-card.entity";
import { UserModule } from "src/user/user.module";
import { QueueModule } from "src/redis/queue/queue.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivationCard]),
    UserModule,
    QueueModule,
  ],
  controllers: [ActivationCardController],
  providers: [ActivationCardService],
})
export class ActivationCardModule {}
