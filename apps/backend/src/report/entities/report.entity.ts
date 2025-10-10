import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { ReportStatus } from "../type/enum/report-status.enum";
import { ReportCategory } from "../type/enum/report-category.enum";
import { ReportSeverity } from "../type/enum/report-severity.enum";
import { User } from "src/user/entities/user.entity";
import { File } from "src/file/entities/file.entity";

@Entity()
export class Report extends ChronoEntity {
  @ManyToOne(() => User, { onDelete: "SET NULL" })
  user: User;
  w;
  @Column({
    type: "varchar",
  })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({
    type: "enum",
    enum: ReportCategory,
  })
  category: ReportCategory;

  @Column({
    type: "enum",
    enum: ReportStatus,
    default: ReportStatus.OPEN,
  })
  status: ReportStatus;

  @OneToOne(() => File, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn()
  screenshot?: File;

  @Column({
    type: "enum",
    enum: ReportSeverity,
    default: ReportSeverity.MEDIUM,
  })
  severity: ReportSeverity;
}
