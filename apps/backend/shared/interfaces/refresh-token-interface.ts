import { JwtPayload } from "src/auth/types/interfaces/payload.interface";

export interface RefreshTokenPayload {
  refreshToken: string;
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
