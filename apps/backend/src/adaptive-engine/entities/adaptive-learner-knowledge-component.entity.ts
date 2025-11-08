import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { AdaptiveLearner } from "./adaptive-learner.entity";
import { KnowledgeComponent } from "src/knowledge-component/entities/knowledge-component.entity";

@Entity({ name: "adaptive_learner_knowledge_component" })
@Unique("UQ_learner_component", ["adaptiveLearner", "knowledgeComponent"])
export class AdaptiveLearnerKnowledgeComponent extends ChronoEntity {
  @ManyToOne(() => AdaptiveLearner, { onDelete: "CASCADE" })
  @JoinColumn({ name: "adaptive_learner_id" })
  adaptiveLearner: AdaptiveLearner;

  @ManyToOne(() => KnowledgeComponent, { onDelete: "CASCADE" })
  @JoinColumn({ name: "knowledge_component_id" })
  knowledgeComponent: KnowledgeComponent;

  @Column({ type: "float", default: 0.2 })
  mastery: number;
}
