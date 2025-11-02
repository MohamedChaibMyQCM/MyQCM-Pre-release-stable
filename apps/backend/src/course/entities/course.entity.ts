import { ChronoEntity } from "abstract/base-chrono.entity";
import { Subject } from "src/subject/entities/subject.entity";
import { Column, Entity, Index, ManyToOne, OneToMany } from "typeorm";
import { KnowledgeComponent } from "src/knowledge-component/entities/knowledge-component.entity";

@Entity()
export class Course extends ChronoEntity {
  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Index()
  @ManyToOne(() => Subject, (subject) => subject)
  subject: Subject;

  @Column({
    type: "float",
    default: 0.3,
  })
  learning_rate: number;

  @Column({
    type: "float",
    default: 0.2,
  })
  guessing_probability: number;

  @Column({
    type: "float",
    default: 0.1,
  })
  slipping_probability: number;

  @Column({
    default: null,
    nullable: true,
  })
  attachment: string;

  @OneToMany(
    () => KnowledgeComponent,
    (knowledgeComponent) => knowledgeComponent.course,
  )
  knowledgeComponents: KnowledgeComponent[];
}
