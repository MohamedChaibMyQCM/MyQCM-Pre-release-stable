import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, Index } from "typeorm";

@Entity({ name: "kc_suggestion_log" })
export class KnowledgeComponentSuggestionLog extends ChronoEntity {
  @Index("idx_kc_suggestion_log_course")
  @Column({ type: "uuid" })
  course_id: string;

  @Column({ type: "varchar", length: 160 })
  model: string;

  @Column({ type: "int" })
  requested: number;

  @Column({ type: "int" })
  processed: number;

  @Column({ type: "int", default: 0 })
  skipped: number;

  @Column({ type: "int", default: 0 })
  options_skipped: number;

  @Column({ type: "int", default: 0 })
  prompt_tokens: number;

  @Column({ type: "int", default: 0 })
  completion_tokens: number;

  @Column({ type: "int", default: 0 })
  total_tokens: number;

  @Column({ type: "jsonb", nullable: true })
  request_ids?: string[];

  @Column({ type: "jsonb", nullable: true })
  initiated_by?: {
    userId?: string;
    email?: string;
    name?: string;
  };
}
