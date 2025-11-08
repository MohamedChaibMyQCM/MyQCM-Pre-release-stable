import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class AdminAuditLog extends ChronoEntity {
  @Column({ type: "uuid", nullable: true })
  adminId: string | null;

  @Column({ type: "varchar", length: 255 })
  adminEmail: string;

  @Column({ type: "varchar", length: 160 })
  resource: string;

  @Column({ type: "varchar", length: 160 })
  action: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  recordId?: string | null;

  @Column({ type: "jsonb", nullable: true })
  context?: Record<string, unknown> | null;
}
