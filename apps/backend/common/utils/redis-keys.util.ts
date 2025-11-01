export class RedisKeys {
  static getRedisEmailVerification(userId: string) {
    return `email-verification:${userId}`;
  }
  static getRedisUserSafeSession(params: {
    userId: string;
    refreshTokenId: string;
  }) {
    const { userId, refreshTokenId } = params;
    return `user:session:${userId}:${refreshTokenId}`;
  }
  static getRedisUserSessionsSet(userId: string) {
    return `user:session:${userId}`;
  }
  static getRedisXpConfig() {
    return `config:xp`;
  }
  static getRedisXpLevelsConfig() {
    return "config:xp:levels";
  }
  static getRedisAlphaXpConfig() {
    return "config:alpha:xp";
  }
  static getRedisTransactionConfig() {
    return `config:transaction`;
  }
  static getRedisAccuracyThresholdConfig() {
    return `config:accuracy-threshold`;
  }
}
