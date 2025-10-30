// src/mail/mail.service.ts

import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { BasicEmailInterface } from "./types/basic-email.interface";
import * as path from "path";
import * as fs from "fs";
import * as ejs from "ejs";
import { WelcomeEmail } from "./types/welcome-email.interface";
import { NewLoginEmail } from "./types/new-login-email.interface";
import { ResetPasswordEmail } from "./types/reset-password-email.interafce";
import { getEnvOrFatal } from "common/utils/env.util";
import { TrainingSessionReminderEmail } from "./types/training-session-reminder-email.interface";
import { EmailVerificationEmail } from "./types/email-verification-email.interface";
import { IConsumeActivationCardEmail } from "./types/cunsome-activation-card-email.interface";

@Injectable()
export class MailService {
  private readonly EMAIL_FROM = `My Qcm aljazayr ${getEnvOrFatal("EMAIL_FROM")}`;
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendMail(options: BasicEmailInterface) {
    try {
      const data = {
        from: this.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text,
      };
      await this.transporter.sendMail(data);
      return true;
    } catch (error) {
      Logger.error(`Error sending welcome email: ${error}`);
      throw new Error(`Error sending welcome email: ${error}`);
    }
  }

  async sendWelcomeEmail(options: WelcomeEmail) {
    try {
      const data = {
        from: this.EMAIL_FROM,
        to: options.email,
        subject: "Welcome to My Qcm aljazayr",
        html: await this.renderTemplate("welcome_email", options),
      };
      await this.transporter.sendMail(data);
      return true;
    } catch (error) {
      Logger.error(`Error sending welcome email: ${error}`);
      throw new Error(`Error sending welcome email: ${error}`);
    }
  }
  async sendNewLoginEmail(options: NewLoginEmail) {
    try {
      const data = {
        from: this.EMAIL_FROM,
        to: options.email,
        subject: "New Login",
        html: await this.renderTemplate("new_login_email", options),
      };
      await this.transporter.sendMail(data);
      return true;
    } catch (error) {
      Logger.error(`Error sending new login email: ${error}`);
      throw new Error(`Error sending new login email: ${error}`);
    }
  }

  async sendPasswordResetEmail(options: ResetPasswordEmail) {
    try {
      const data = {
        from: this.EMAIL_FROM,
        to: options.email,
        subject: "Password Reset Request",
        html: await this.renderTemplate("reset_password_email", options),
      };
      await this.transporter.sendMail(data);

      return true;
    } catch (error) {
      Logger.error(`Error sending reset password email: ${error}`);
      throw new Error(`Error sending reset password email: ${error}`);
    }
  }
  async sendTrainingSessionReminderEmail(
    options: TrainingSessionReminderEmail,
  ) {
    try {
      const data = {
        from: this.EMAIL_FROM,
        to: options.email,
        subject: "Your training session has started",
        html: await this.renderTemplate("training-session-reminder", options),
      };
      await this.transporter.sendMail(data);

      return true;
    } catch (error) {
      Logger.error(`Error sending training session email: ${error}`);
      throw new Error(`Error sending training session email: ${error}`);
    }
  }
  async sendEmailVerificationEmail(options: EmailVerificationEmail) {
    try {
      const data = {
        from: this.EMAIL_FROM,
        to: options.email,
        subject: "Email Verification",
        html: await this.renderTemplate("email_verification_email", options),
      };
      await this.transporter.sendMail(data);
      return true;
    } catch (error) {
      Logger.error(`Error sending email verification email: ${error}`);
      throw new Error(`Error sending email verification email: ${error}`);
    }
  }
  async sendConsumeActivationCardEmail(options: IConsumeActivationCardEmail) {
    try {
      const data = {
        from: this.EMAIL_FROM,
        to: options.email,
        subject: "Your Plan Has Been Activated!",
        html: await this.renderTemplate("consume-activation-card", options),
      };
      await this.transporter.sendMail(data);

      return true;
    } catch (error) {
      Logger.error(`Error sending consume activation card email: ${error}`);
      throw new Error(`Error sending consume activation card email: ${error}`);
    }
  }
  private resolveTemplatePath(template_name: string): string {
    const candidateDirs = [
      path.resolve(__dirname, "..", "..", "templates"),
      path.resolve(__dirname, "..", "..", "..", "templates"),
    ];

    for (const dir of candidateDirs) {
      const filePath = path.join(dir, `${template_name}.template.ejs`);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }

    throw new Error(
      `Template ${template_name} not found. Looked in: ${candidateDirs.join(", ")}`,
    );
  }

  private async renderTemplate(
    template_name: string,
    data:
      | NewLoginEmail
      | WelcomeEmail
      | ResetPasswordEmail
      | EmailVerificationEmail
      | TrainingSessionReminderEmail
      | IConsumeActivationCardEmail,
  ): Promise<string> {
    const template_path = this.resolveTemplatePath(template_name);
    return ejs.renderFile(template_path, data);
  }
}
