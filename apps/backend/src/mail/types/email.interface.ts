export interface SendEmailData {
  name?: string;
  email?: string;
  timestamp?: string;
  device?: string;
  location?: string | string[];
  ip?: string | string[];
  verifcation_url: string;
}
