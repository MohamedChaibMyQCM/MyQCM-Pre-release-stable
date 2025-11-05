import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, MoreThan } from "typeorm";
import {
  FeatureAnnouncement,
  FeatureAnnouncementStatus,
} from "./entities/feature-announcement.entity";
import { FeatureInteraction } from "./entities/feature-interaction.entity";
import { CreateFeatureAnnouncementDto } from "./dto/create-feature-announcement.dto";
import { UpdateFeatureAnnouncementDto } from "./dto/update-feature-announcement.dto";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class FeatureAnnouncementService {
  constructor(
    @InjectRepository(FeatureAnnouncement)
    private featureAnnouncementRepository: Repository<FeatureAnnouncement>,
    @InjectRepository(FeatureInteraction)
    private featureInteractionRepository: Repository<FeatureInteraction>
  ) {}

  async create(
    createDto: CreateFeatureAnnouncementDto,
    adminId?: string
  ): Promise<FeatureAnnouncement> {
    const announcement = this.featureAnnouncementRepository.create({
      ...createDto,
      created_by: adminId ? ({ id: adminId } as any) : null,
    });
    return await this.featureAnnouncementRepository.save(announcement);
  }

  async findAll(): Promise<FeatureAnnouncement[]> {
    return await this.featureAnnouncementRepository.find({
      relations: ["created_by"],
      order: { priority: "DESC", release_date: "DESC" },
    });
  }

  async findOne(id: string): Promise<FeatureAnnouncement> {
    const announcement = await this.featureAnnouncementRepository.findOne({
      where: { id },
      relations: ["created_by", "interactions"],
    });

    if (!announcement) {
      throw new NotFoundException(
        `Feature announcement with ID ${id} not found`
      );
    }

    return announcement;
  }

  async update(
    id: string,
    updateDto: UpdateFeatureAnnouncementDto
  ): Promise<FeatureAnnouncement> {
    const announcement = await this.findOne(id);
    Object.assign(announcement, updateDto);
    return await this.featureAnnouncementRepository.save(announcement);
  }

  async remove(id: string): Promise<void> {
    const result = await this.featureAnnouncementRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Feature announcement with ID ${id} not found`
      );
    }
  }

  // Get new features for a user
  async getNewFeatures(
    userId: string,
    userRole: string = "user"
  ): Promise<FeatureAnnouncement[]> {
    // Get all published and active features for the user's role
    const features = await this.featureAnnouncementRepository.find({
      where: {
        status: FeatureAnnouncementStatus.PUBLISHED,
        is_active: true,
      },
      order: { priority: "DESC", release_date: "DESC" },
    });

    // Filter by role
    const roleFilteredFeatures = features.filter(
      (feature) =>
        feature.target_roles.includes("all") ||
        feature.target_roles.includes(userRole)
    );

    // Get user's interactions
    const interactions = await this.featureInteractionRepository.find({
      where: { user: { id: userId } },
      relations: ["feature"],
    });

    const seenFeatureIds = new Set(
      interactions
        .filter((i) => i.seen_at || i.dismissed_at)
        .map((i) => i.feature.id)
    );

    // Filter out already seen/dismissed features
    return roleFilteredFeatures.filter(
      (feature) => !seenFeatureIds.has(feature.id)
    );
  }

  // Record interaction
  async recordInteraction(
    featureId: string,
    userId: string,
    interactionType: "seen" | "tried" | "dismissed"
  ): Promise<FeatureInteraction> {
    const feature = await this.findOne(featureId);

    let interaction = await this.featureInteractionRepository.findOne({
      where: {
        feature: { id: featureId },
        user: { id: userId },
      },
    });

    if (!interaction) {
      interaction = this.featureInteractionRepository.create({
        feature: { id: featureId } as any,
        user: { id: userId } as any,
      });
    }

    const now = new Date();
    switch (interactionType) {
      case "seen":
        interaction.seen_at = now;
        break;
      case "tried":
        interaction.tried_at = now;
        if (!interaction.seen_at) {
          interaction.seen_at = now;
        }
        break;
      case "dismissed":
        interaction.dismissed_at = now;
        if (!interaction.seen_at) {
          interaction.seen_at = now;
        }
        break;
    }

    return await this.featureInteractionRepository.save(interaction);
  }

  // Get changelog (all published features)
  async getChangelog(
    filter?: string,
    limit: number = 20
  ): Promise<FeatureAnnouncement[]> {
    const query = this.featureAnnouncementRepository
      .createQueryBuilder("feature")
      .where("feature.status = :status", {
        status: FeatureAnnouncementStatus.PUBLISHED,
      })
      .andWhere("feature.is_active = :isActive", { isActive: true })
      .orderBy("feature.release_date", "DESC")
      .take(limit);

    if (filter) {
      query.andWhere("feature.type = :type", { type: filter });
    }

    return await query.getMany();
  }

  // Get analytics
  async getAnalytics() {
    const totalAnnouncements = await this.featureAnnouncementRepository.count();

    const byStatus = await this.featureAnnouncementRepository
      .createQueryBuilder("feature")
      .select("feature.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("feature.status")
      .getRawMany();

    const byType = await this.featureAnnouncementRepository
      .createQueryBuilder("feature")
      .select("feature.type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("feature.type")
      .getRawMany();

    const totalInteractions = await this.featureInteractionRepository.count();

    const interactionStats = await this.featureInteractionRepository
      .createQueryBuilder("interaction")
      .select("COUNT(DISTINCT interaction.user)", "uniqueUsers")
      .addSelect(
        "SUM(CASE WHEN interaction.seen_at IS NOT NULL THEN 1 ELSE 0 END)",
        "seenCount"
      )
      .addSelect(
        "SUM(CASE WHEN interaction.tried_at IS NOT NULL THEN 1 ELSE 0 END)",
        "triedCount"
      )
      .addSelect(
        "SUM(CASE WHEN interaction.dismissed_at IS NOT NULL THEN 1 ELSE 0 END)",
        "dismissedCount"
      )
      .getRawOne();

    return {
      totalAnnouncements,
      byStatus,
      byType,
      totalInteractions,
      interactionStats,
    };
  }
}
