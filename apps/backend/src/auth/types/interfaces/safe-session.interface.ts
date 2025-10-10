export interface SafeSessionInterface {
  refreshToken: string;
  issuedAt: Date | string;
  expiresAt: Date | string;
  ip: string;
  userAgent: string;
  deviceId: string;
  geoLocation: string;
  lastUsedAt: Date | string;
}
