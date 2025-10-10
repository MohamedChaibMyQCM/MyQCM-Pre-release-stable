import { ClientInfo } from "shared/interfaces/client-info.interface";

export interface CreateSafeSessionInterface {
  userId: string;
  refreshToken: string;
  clientInfo: ClientInfo;
}
