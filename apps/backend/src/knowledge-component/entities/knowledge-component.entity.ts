import { ChronoEntity } from "abstract/base-chrono.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { KnowledgeDomain } from "./knowledge-domain.entity";
import { Course } from "src/course/entities/course.entity";
import { Mcq } from "src/mcq/entities/mcq.entity";

@Entity({ name: "knowledge_component" })
export class KnowledgeComponent extends ChronoEntity {
  @Column({ type: "varchar", length: 190, unique: true })
  slug: string;

  @Column({ type: "varchar", length: 190 })
  name: string;

  @Column({ type: "varchar", length: 64, nullable: true })
  code?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "int", default: 1 })
  level: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @ManyToOne(() => KnowledgeDomain, (domain) => domain.components, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "domain_id" })
  domain: KnowledgeDomain;

  @ManyToOne(
    () => KnowledgeComponent,
    (knowledgeComponent) => knowledgeComponent.children,
    {
      nullable: true,
      onDelete: "SET NULL",
    },
  )
  @JoinColumn({ name: "parent_id" })
  parent?: KnowledgeComponent;

  @OneToMany(
    () => KnowledgeComponent,
    (knowledgeComponent) => knowledgeComponent.parent,
  )
  children: KnowledgeComponent[];

  @ManyToMany(() => Mcq, (mcq) => mcq.knowledgeComponents)
  mcqs: Mcq[];

  @ManyToOne(() => Course, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "course_id" })
  course?: Course;
}
