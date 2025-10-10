import { ChronoEntity } from "abstract/base-chrono.entity";
import { Course } from "src/course/entities/course.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity()
export class AdaptiveLearner extends ChronoEntity {
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Course, { onDelete: "CASCADE" })
  @JoinColumn()
  course: Course;

  // Current bkt mastery probability (0 to 1)
  @Column({ type: "float", default: 0.2 })
  mastery: number;

  // Current irt ability probability (0 to 1)
  @Column({ type: "float", default: 0 })
  ability: number;
}
