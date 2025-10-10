import { Module } from "@nestjs/common";
import { EmailWaitingListService } from "./email-waiting-list.service";
import { EmailWaitingListController } from "./email-waiting-list.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailWaitingList } from "./entities/email-waiting-list.entity";

@Module({
  imports: [TypeOrmModule.forFeature([EmailWaitingList])],
  controllers: [EmailWaitingListController],
  providers: [EmailWaitingListService],
})
export class EmailWaitingListModule {}
