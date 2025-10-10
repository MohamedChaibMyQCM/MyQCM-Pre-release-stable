import { CreateDateColumn, Entity, PrimaryGeneratedColumn, BeforeInsert, BaseEntity } from "typeorm";
import { v4 as uuidv4 } from "uuid";

// this is the base class for all entities that need to have a unique id and a creation date and doesnt need updateAt field
@Entity()
export abstract class SemiChronoEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string = uuidv4();

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
