import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { FreelancerModule } from "./freelancer/freelancer.module";
import { McqModule } from "./mcq/mcq.module";
import { TransactionModule } from "./transaction/transaction.module";
import { WalletModule } from "./wallet/wallet.module";
import { UnitModule } from "./unit/unit.module";
import { SubjectModule } from "./subject/subject.module";
import { UniversityModule } from "./university/university.module";
import { FacultyModule } from "./faculty/faculty.module";
import { CourseModule } from "./course/course.module";
import { UserModule } from "./user/user.module";
import { OptionModule } from "./option/option.module";
import { ProgressModule } from "./progress/progress.module";
import { ClinicalCaseModule } from "./clinical_case/clinical_case.module";
import { AssistantModule } from "./assistant/assistant.module";
import { MailModule } from "./mail/mail.module";
import { AdminModule } from "./admin/admin.module";
import { PaymentModule } from "./payment/payment.module";
import { PlanModule } from "./plan/plan.module";
import { EmailWaitingListModule } from "./email-waiting-list/email-waiting-list.module";
import { NotificationModule } from "./notification/notification.module";
import { FormationModule } from "./formation/formation.module";
import { PostgresConfig } from "config/postgres-config";
import { ThrottlerConfig } from "config/throttler-config";
import { QueueModule } from "./redis/queue/queue.module";
import { RedisModule } from "./redis/redis.module";
import { dynamicImport } from "common/helper/dynamic-import.helper";
import { AdminJsConfig } from "config/adminjs.config";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { ActivationCardModule } from "./activation-cards/activation-card.module";
import { TrainingSessionModule } from "./training-session/training-session.module";
import { ModeModule } from "./mode/mode.module";
import { AdaptiveEngineModule } from "./adaptive-engine/adaptive-engine.module";
import { ReportModule } from "./report/report.module";
import { FileModule } from "./file/file.module";
import { GenerationModule } from "./generation/generation.module";
import { RewardModule } from "./reward/reward.module";
import { KnowledgeComponentModule } from "./knowledge-component/knowledge-component.module";
@Module({
  imports: [
    TypeOrmModule.forRoot(PostgresConfig),
    ThrottlerModule.forRoot(ThrottlerConfig),
    dynamicImport("@adminjs/nestjs").then(({ AdminModule }) =>
      AdminModule.createAdminAsync({
        useFactory: () => AdminJsConfig,
      }),
    ),
    AuthModule,
    QueueModule,
    FreelancerModule,
    McqModule,
    TransactionModule,
    WalletModule,
    UnitModule,
    SubjectModule,
    UniversityModule,
    FacultyModule,
    CourseModule,
    UserModule,
    OptionModule,
    ProgressModule,
    ClinicalCaseModule,
    AssistantModule,
    MailModule,
    AdminModule,
    PaymentModule,
    PlanModule,
    NotificationModule,
    EmailWaitingListModule,
    FormationModule,
    RedisModule,
    PrometheusModule.register(),
    ActivationCardModule,
    TrainingSessionModule,
    ModeModule,
    AdaptiveEngineModule,
    ReportModule,
    FileModule,
    GenerationModule,
    RewardModule,
    KnowledgeComponentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [],
})
export class AppModule {}
