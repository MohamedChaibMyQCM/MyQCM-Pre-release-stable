import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { GenerationRequest } from "./generation-request.entity";
import { GenerationItemType } from "../enums/generation-item-type.enum";
import { GenerationItemStatus } from "../enums/generation-item-status.enum";

type GenerationOption = {
  id?: string;
  content: string;
  is_correct: boolean;
};

@Entity()
export class GenerationItem extends ChronoEntity {
  @ManyToOne(() => GenerationRequest, (request) => request.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "requestId" })
  request: GenerationRequest;

  @RelationId((item: GenerationItem) => item.request)
  requestId: string | null;

  @Column({
    type: "enum",
    enum: GenerationItemType,
  })
  type: GenerationItemType;

  @Column({
    type: "text",
    default: "",
  })
  stem: string;

  @Column({
    type: "jsonb",
    default: () => "'[]'",
  })
  options: GenerationOption[];

  @Column({
    type: "text",
    nullable: true,
  })
  expected_answer: string | null;

  @Column({
    type: "enum",
    enum: GenerationItemStatus,
    default: GenerationItemStatus.DRAFT,
  })
  status: GenerationItemStatus;

  @Column({
    type: "text",
    nullable: true,
  })
  rejection_reason: string | null;
}
