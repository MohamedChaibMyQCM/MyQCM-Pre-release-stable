import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, Index } from "typeorm";

@Entity({ name: "kc_suggestion_call" })
export class KnowledgeComponentSuggestionCall extends ChronoEntity {
  @Index("idx_kc_suggestion_call_course")
  @Column({ type: "uuid", nullable: true })
  course_id?: string | null;

  @Column({ type: "jsonb", nullable: true })
  mcq_ids?: string[] | null;

  @Column({ type: "varchar", length: 160 })
  model: string;

  @Column({ type: "integer", default: 0 })
  prompt_tokens: number;

  @Column({ type: "integer", default: 0 })
  completion_tokens: number;

  @Column({ type: "integer", default: 0 })
  total_tokens: number;

  @Column({ type: "jsonb", nullable: true })
  extra_labels?: Record<string, string>;
}
