import { IPlanActivationEmail } from "./plan-activation-email.interface";

export interface IConsumeActivationCardEmail extends IPlanActivationEmail {
  activation_code: string;
}
