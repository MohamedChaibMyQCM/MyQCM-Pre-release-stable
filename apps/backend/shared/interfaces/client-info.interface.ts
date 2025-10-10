import { IpInfo } from "./ip-info.interface";

export interface ClientInfo {
  ip: string;
  browser: string;
  os: string;
  agent: string;
  ipInfo: IpInfo | null;
}
