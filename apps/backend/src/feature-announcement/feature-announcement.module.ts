import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FeatureAnnouncementService } from "./feature-announcement.service";
import { FeatureAnnouncementController } from "./feature-announcement.controller";
import { FeatureAnnouncement } from "./entities/feature-announcement.entity";
import { FeatureInteraction } from "./entities/feature-interaction.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureAnnouncement, FeatureInteraction]),
  ],
  controllers: [FeatureAnnouncementController],
  providers: [FeatureAnnouncementService],
  exports: [FeatureAnnouncementService],
})
export class FeatureAnnouncementModule {}
