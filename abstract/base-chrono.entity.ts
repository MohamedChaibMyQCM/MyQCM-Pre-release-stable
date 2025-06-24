import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  BaseEntity,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";

@Entity()
export abstract class ChronoEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string = uuidv4();

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
