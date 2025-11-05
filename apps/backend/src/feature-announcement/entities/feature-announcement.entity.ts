import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { ChronoEntity } from "abstract/base-chrono.entity";
import { Admin } from "src/admin/entities/admin.entity";
import { FeatureInteraction } from "./feature-interaction.entity";

export enum FeatureAnnouncementType {
  MAJOR = "major",
  MINOR = "minor",
  UPDATE = "update",
  BUGFIX = "bugfix",
}

export enum FeatureAnnouncementStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum MediaType {
  NONE = "none",
  IMAGE = "image",
  VIDEO = "video",
  LOTTIE = "lottie",
}

export interface HighlightStep {
  elementId: string;
  title: string;
  description: string;
}

@Entity("feature_announcements")
export class FeatureAnnouncement extends ChronoEntity {
  @Column({ type: "varchar", length: 20 })
  version: string;

  @Column({ type: "date" })
  release_date: Date;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({
    type: "enum",
    enum: FeatureAnnouncementType,
    default: FeatureAnnouncementType.MINOR,
  })
  type: FeatureAnnouncementType;

  @Column({
    type: "enum",
    enum: FeatureAnnouncementStatus,
    default: FeatureAnnouncementStatus.DRAFT,
  })
  status: FeatureAnnouncementStatus;

  @Column({
    type: "enum",
    enum: MediaType,
    default: MediaType.NONE,
  })
  media_type: MediaType;

  @Column({ type: "text", nullable: true })
  media_url: string;

  @Column({ type: "text", nullable: true })
  thumbnail_url: string;

  @Column({ type: "jsonb", nullable: true })
  highlight_steps: HighlightStep[];

  @Column({ type: "simple-array", default: ["student"] })
  target_roles: string[];

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "varchar", length: 100, nullable: true })
  cta_text: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  cta_link: string;

  @Column({ type: "int", default: 0 })
  priority: number;

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: "created_by" })
  created_by: Admin;

  @OneToMany(
    () => FeatureInteraction,
    (interaction) => interaction.feature,
    { cascade: true }
  )
  interactions: FeatureInteraction[];
}
