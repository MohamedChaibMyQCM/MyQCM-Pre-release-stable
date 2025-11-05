import { Column, Entity, ManyToOne, JoinColumn, Index } from "typeorm";
import { ChronoEntity } from "abstract/base-chrono.entity";
import { FeatureAnnouncement } from "./feature-announcement.entity";
import { User } from "src/user/entities/user.entity";

@Entity("feature_interactions")
@Index(["feature", "user"], { unique: true })
export class FeatureInteraction extends ChronoEntity {
  @ManyToOne(() => FeatureAnnouncement, (feature) => feature.interactions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "feature_id" })
  @Index()
  feature: FeatureAnnouncement;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  @Index()
  user: User;

  @Column({ type: "timestamp", nullable: true })
  seen_at: Date;

  @Column({ type: "timestamp", nullable: true })
  tried_at: Date;

  @Column({ type: "timestamp", nullable: true })
  dismissed_at: Date;
}
