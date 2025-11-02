import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { KnowledgeComponent } from "./knowledge-component.entity";

@Entity({ name: "knowledge_domain" })
export class KnowledgeDomain extends ChronoEntity {
  @Column({ type: "varchar", length: 160, unique: true })
  slug: string;

  @Column({ type: "varchar", length: 160 })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "int", default: 0 })
  sortOrder: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(
    () => KnowledgeComponent,
    (knowledgeComponent) => knowledgeComponent.domain,
  )
  components: KnowledgeComponent[];
}
