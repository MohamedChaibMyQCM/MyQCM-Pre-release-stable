export interface NewLoginEmail {
  name: string;
  email: string;
  timestamp: string;
  device: string;
  location: string | string[];
  ip: string | string[];
}
