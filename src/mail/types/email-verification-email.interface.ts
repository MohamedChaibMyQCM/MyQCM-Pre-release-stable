// export interface EmailVerificationEmail extends WelcomeEmail {} // for now they are very simmiliar
export interface EmailVerificationEmail {
  name: string;
  email: string;
  otp_code: string; // this is the code that the user needs to enter to verify their email
}
