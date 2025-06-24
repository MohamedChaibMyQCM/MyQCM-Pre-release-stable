import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtPayload } from "./types/interfaces/payload.interface";
import {
  JsonWebTokenError,
  JwtService,
  NotBeforeError,
  TokenExpiredError,
} from "@nestjs/jwt";
import { JwtAccessConfig, JwtRefreshConfig } from "config/jwt.config";
import { getEnvOrFatal } from "common/utils/env.util";
import { generateDeviceId } from "common/utils/crypto";
import { randomUUID } from "crypto";
import { SafeSessionInterface } from "./types/interfaces/safe-session.interface";
import { hashString } from "common/utils/hashing";
import { RedisKeys } from "common/utils/redis-keys.util";
import { CookieConfig } from "config/cookie.config";
import { Request, Response } from "express";
import { CreateSafeSessionInterface } from "./types/interfaces/create-safe-session.interface";
import { RedisService } from "src/redis/redis.service";
import { ValidateSafeSessionInterface } from "./types/interfaces/validate-safe-session.interface";

@Injectable()
export class AuthService {
  private readonly REFRESH_TOKEN_EXPIRATION = parseInt(
    getEnvOrFatal<string>("JWT_REFRESH_EXPIRATION"),
    10,
  );
  private readonly REFRESH_TOKEN_COOKIE_NAME = getEnvOrFatal<string>(
    "REFRESH_TOKEN_COOKIE_NAME",
  );
  private readonly DEVICE_ID_COOKIE_NAME = getEnvOrFatal<string>(
    "DEVICE_ID_COOKIE_NAME",
  );
  private readonly USER_ID_COOKIE_NAME = getEnvOrFatal<string>(
    "USER_ID_COOKIE_NAME",
  );
  private readonly REFRESH_TOKEN_ID_COOKIE_NAME = getEnvOrFatal<string>(
    "REFRESH_TOKEN_ID_COOKIE_NAME",
  );

  constructor(
    private jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}
  async generateAccessToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload, JwtAccessConfig);
  }
  async generateRefreshToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload, JwtRefreshConfig);
  }
  async signSingleUseToken(payload: JwtPayload, secret: string) {
    return this.jwtService.signAsync(payload, { secret, expiresIn: "10m" });
  }
  async signTokens(payload: JwtPayload) {
    return {
      accessToken: await this.generateAccessToken(payload),
      refreshToken: await this.generateRefreshToken(payload),
    };
  }
  async decodeToken(token: string) {
    return this.jwtService.decode(token) as JwtPayload;
  }
  async validateSingleUseToken(token: string, secret: string) {
    try {
      return await this.jwtService.verifyAsync(token, { secret });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException("Token has expired.");
      } else if (error instanceof JsonWebTokenError) {
        throw new BadRequestException("Invalid token.");
      } else if (error instanceof NotBeforeError) {
        throw new BadRequestException("Token is not active yet.");
      } else {
        throw new UnauthorizedException("Token verification failed.");
      }
    }
  }
  async createSafeSession(
    createSafeSession: CreateSafeSessionInterface,
    res: Response,
  ) {
    const { userId, refreshToken, clientInfo } = createSafeSession;
    const deviceId = generateDeviceId(clientInfo); // Generate a unique device id based on the client info to associate the refresh token with the device and avoid multiple logins and token hijacking
    const refreshTokenId = randomUUID(); //random refresh token id to identify the refresh token in redis with the userId
    const expiresAt = new Date(
      Date.now() + this.REFRESH_TOKEN_EXPIRATION * 60 * 60 * 1000,
    );
    const safeSession_data: SafeSessionInterface = {
      refreshToken: await hashString(refreshToken), // Hash the refresh token before storing it for more security in case redis is compromised
      issuedAt: new Date(),
      expiresAt,
      ip: clientInfo.ip,
      userAgent: clientInfo.agent,
      deviceId: deviceId,
      geoLocation: `${clientInfo.ipInfo.city}, ${clientInfo.ipInfo.country}`,
      lastUsedAt: new Date(),
    };
    // add devices limitations
    await this.redisService.set(
      RedisKeys.getRedisUserSafeSession({
        userId: userId,
        refreshTokenId: refreshTokenId,
      }),
      JSON.stringify(safeSession_data),
      this.REFRESH_TOKEN_EXPIRATION * 60 * 60,
    );
    await this.redisService.sadd(
      RedisKeys.getRedisUserSessionsSet(userId),
      refreshTokenId,
    );

    const safe_session_cookies_config = {
      ...CookieConfig,
      expires: expiresAt,
    };
    res.cookie(
      this.REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      safe_session_cookies_config,
    );
    res.cookie(
      this.REFRESH_TOKEN_ID_COOKIE_NAME,
      refreshTokenId,
      safe_session_cookies_config,
    );
    res.cookie(
      this.DEVICE_ID_COOKIE_NAME,
      deviceId,
      safe_session_cookies_config,
    );
    res.cookie(this.USER_ID_COOKIE_NAME, userId, safe_session_cookies_config);
  }
  async validateUserSession(
    validateSafeSession: ValidateSafeSessionInterface,
    req: Request,
  ) {
    const { clientInfo } = validateSafeSession;
    const userId = req.cookies[this.USER_ID_COOKIE_NAME];
    const refreshTokenId = req.cookies[this.REFRESH_TOKEN_ID_COOKIE_NAME];
    const deviceId = req.cookies[this.DEVICE_ID_COOKIE_NAME];
    if (!userId || !refreshTokenId || !deviceId) {
      throw new UnauthorizedException("Invalid session");
    }
    // Calculate expected device ID based on current client info
    const expected_device_id = generateDeviceId(clientInfo);
    if (deviceId !== expected_device_id) {
      Logger.warn(
        `Potential session hijacking attempt for user ${userId}. Device ID mismatch.`,
      );
      throw new UnauthorizedException("Invalid session");
    }
    const session_data: SafeSessionInterface = await this.redisService.get(
      RedisKeys.getRedisUserSafeSession({
        userId: userId,
        refreshTokenId: refreshTokenId,
      }),
      true,
    );
    if (!session_data) {
      throw new UnauthorizedException("Invalid session");
    }
    return session_data.refreshToken;
  }
  async deleteSafeSession(userId: string, req: Request, res: Response) {
    const refreshTokenId = req.cookies[this.REFRESH_TOKEN_ID_COOKIE_NAME];
    if (!refreshTokenId) {
      Logger.warn(`No refresh token id found for user ${userId}`);
      throw new UnauthorizedException("Invalid session");
    }
    // Delete the session from Redis
    await this.redisService.delete(
      RedisKeys.getRedisUserSafeSession({
        userId,
        refreshTokenId,
      }),
    );

    // Remove this session ID from the user's sessions set
    await this.redisService.srem(
      RedisKeys.getRedisUserSessionsSet(userId),
      refreshTokenId,
    );
    const cookieOptions = { ...CookieConfig, maxAge: 0 };
    res.clearCookie(this.REFRESH_TOKEN_COOKIE_NAME, cookieOptions);
    res.clearCookie(this.REFRESH_TOKEN_ID_COOKIE_NAME, cookieOptions);
    res.clearCookie(this.USER_ID_COOKIE_NAME, cookieOptions);
    res.clearCookie(this.DEVICE_ID_COOKIE_NAME, cookieOptions);
  }
}
