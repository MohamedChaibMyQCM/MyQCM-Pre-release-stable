import { Processor, Process } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Job } from "bullmq";
import { MailService } from "src/mail/mail.service";
import { BasicEmailInterface } from "src/mail/types/basic-email.interface";
import { IConsumeActivationCardEmail } from "src/mail/types/cunsome-activation-card-email.interface";
import { EmailVerificationEmail } from "src/mail/types/email-verification-email.interface";
import { NewLoginEmail } from "src/mail/types/new-login-email.interface";
import { ResetPasswordEmail } from "src/mail/types/reset-password-email.interafce";
import { TrainingSessionReminderEmail } from "src/mail/types/training-session-reminder-email.interface";
import { WelcomeEmail } from "src/mail/types/welcome-email.interface";

@Injectable()
@Processor("email-queue")
export class EmailQueueProcessor {
  constructor(private readonly mailService: MailService) {}
  @Process("send-mail")
  async sendEmailVerificaitonCode(job: Job<{ mailDto: BasicEmailInterface }>) {
    const { mailDto } = job.data;
    await this.mailService.sendMail(mailDto as BasicEmailInterface);
  }
  @Process("send-welcome-email")
  async sendWelcomeEmail(job: Job<{ mailDto: WelcomeEmail }>) {
    const { mailDto } = job.data;
    await this.mailService.sendWelcomeEmail(mailDto);
  }
  @Process("send-email-verification-email")
  async sendEmailVerificationEmail(
    job: Job<{ mailDto: EmailVerificationEmail }>,
  ) {
    const { mailDto } = job.data;
    await this.mailService.sendEmailVerificationEmail(mailDto);
  }
  @Process("send-new-login-email")
  async sendNewLoginEmail(job: Job<{ mailDto: NewLoginEmail }>) {
    const { mailDto } = job.data;
    await this.mailService.sendNewLoginEmail(mailDto);
  }
  @Process("send-password-reset-email")
  async sendPasswordResetEmail(job: Job<{ mailDto: ResetPasswordEmail }>) {
    const { mailDto } = job.data;
    await this.mailService.sendPasswordResetEmail(mailDto);
  }
  @Process("send-training-session-reminder")
  async sendTrainingSessionReminder(
    job: Job<{ mailDto: TrainingSessionReminderEmail }>,
  ) {
    const { mailDto } = job.data;
    await this.mailService.sendTrainingSessionReminderEmail(
      mailDto as TrainingSessionReminderEmail,
    );
  }
  @Process("send-consume-activation-card-email")
  async sendConsumeActivationCardEmail(
    job: Job<{ mailDto: IConsumeActivationCardEmail }>,
  ) {
    const { mailDto } = job.data;
    await this.mailService.sendConsumeActivationCardEmail(mailDto);
  }
}
