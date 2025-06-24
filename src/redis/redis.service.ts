import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { RedisKeys } from "common/utils/redis-keys.util";
import { DefaultAccuracyThresholdConfig } from "config/default-accuracy-threshold.config";
import { DefaultXPLevelsConfig } from "config/default-levels.config";
import { DefaultTransactionConfig } from "config/default-transaction.config";
import { DefaultXpConfig } from "config/default-xp.config";
import { Redis } from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject("REDIS_CLIENT")
    private readonly redisClient: Redis,
  ) {}

  async onModuleInit() {
    this.logger.log("Initializing Redis Service...");
    try {
      const health = await this.healthCheck();
      if (health.status != "ok") {
        this.logger.error(`Redis health check failed: ${health.error}`);
        throw new Error("Redis connection failed");
      }
      await this.initDefaultKeys();
    } catch (error) {
      this.logger.error("Error during Redis initialization", error);
    }
  }
  async healthCheck(): Promise<{
    status: string;
    ping?: string;
    error?: string;
  }> {
    try {
      const pingResult = await this.redisClient.ping();
      return { status: "ok", ping: pingResult };
    } catch (error) {
      this.logger.error("Redis health check failed", error);
      return { status: "error", error: error.message };
    }
  }
  /**
   * Set default keys in Redis
   * @returns Promise that resolves when keys are set
   * @remarks Override this method in a subclass to set default keys
   *
   * */
  async initDefaultKeys(): Promise<void> {
    await this.initDefaultXpConfig();
    await this.initDefaultXpLevelsConfig();
    await this.initDefaultTransaction();
    await this.initDefaultAccuracyThreshold();
  }

  /**
   * Initialize default XP configuration in Redis
   * @returns Promise that resolves when config is set
   */

  private async initDefaultXpConfig() {
    const existing_config = await this.get(RedisKeys.getRedisXpConfig());
    if (!existing_config) {
      this.logger.warn("Initializing default XP config in Redis...");
      await this.set(
        RedisKeys.getRedisXpConfig(),
        DefaultXpConfig,
        undefined,
        true,
      );
    }
    return;
  }
  private async initDefaultXpLevelsConfig() {
    const existing_config = await this.get(RedisKeys.getRedisXpLevelsConfig());
    if (!existing_config) {
      this.logger.warn("Initializing default XP levels config in Redis...");
      await this.set(
        RedisKeys.getRedisXpLevelsConfig(),
        DefaultXPLevelsConfig,
        undefined,
        true,
      );
    }
    return;
  }
  private async initDefaultTransaction() {
    const existing_config = await this.get(
      RedisKeys.getRedisTransactionConfig(),
    );
    if (!existing_config) {
      this.logger.warn("Initializing default transaction config in Redis...");
      await this.set(
        RedisKeys.getRedisTransactionConfig(),
        DefaultTransactionConfig,
        undefined,
        true,
      );
    }
    return;
  }

  private async initDefaultAccuracyThreshold() {
    const existing_config = await this.get(
      RedisKeys.getRedisAccuracyThresholdConfig(),
    );
    if (!existing_config) {
      this.logger.warn(
        "Initializing default accuracy threshold config in Redis...",
      );
      await this.set(
        RedisKeys.getRedisAccuracyThresholdConfig(),
        DefaultAccuracyThresholdConfig,
        undefined,
        true,
      );
    }
    return;
  }
  /**
   * Delete a key
   * @param key Key to delete
   * @returns Number of keys deleted (1 or 0)
   */
  async delete(key: string): Promise<number> {
    try {
      return await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key: ${key}`, error);
      throw error;
    }
  }

  async srem(key: string, member: string): Promise<number> {
    try {
      return await this.redisClient.srem(key, member);
    } catch (error) {
      this.logger.error(`Failed to remove member from set: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get value by key
   * @param key Key to retrieve
   * @param parse Whether to parse the value as JSON
   * @returns The value or null if key doesn't exist
   */
  async get<T = any>(key: string, parse: boolean = false): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);

      if (value === null) return null;

      return parse ? JSON.parse(value) : (value as unknown as T);
    } catch (error) {
      this.logger.error(`Failed to get key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Set a key with optional TTL
   * @param key Key to set
   * @param value Value to store
   * @param ttl Optional TTL in seconds
   * @param stringify Whether to stringify the value (default: true for objects)
   * @returns "OK" if successful
   */
  async set(
    key: string,
    value: any,
    ttl?: number,
    stringify: boolean = typeof value !== "string",
  ): Promise<string> {
    try {
      const stringValue = stringify ? JSON.stringify(value) : value;

      if (ttl) {
        return await this.redisClient.set(key, stringValue, "EX", ttl);
      } else {
        return await this.redisClient.set(key, stringValue);
      }
    } catch (error) {
      this.logger.error(`Failed to set key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Add a member to a set
   * @param key Set key
   * @param member Member to add
   * @returns Number of members added (1 if new, 0 if already present)
   */
  async sadd(key: string, member: string): Promise<number> {
    return this.redisClient.sadd(key, member);
  }

  /**
   * Remove a member from a set
   * @param key Set key
   * @param member Member to remove
   * @returns Number of members removed (1 if removed, 0 if not present)
   */
  async smembers(key: string): Promise<string[]> {
    return this.redisClient.smembers(key);
  }

  /**
   * Increment a key by 1
   * @param key Key to increment
   * @returns New value after increment
   */
  async increment(key: string): Promise<number> {
    try {
      return await this.redisClient.incr(key);
    } catch (error) {
      this.logger.error(`Failed to increment key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Check if key exists
   * @param key Key to check
   * @returns Boolean indicating if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check key existence: ${key}`, error);
      throw error;
    }
  }

  /**
   * Set expiration time for a key
   * @param key Key to set expiration for
   * @param ttl Time to live in seconds
   * @returns 1 if successful, 0 if key doesn't exist
   */
  async expire(key: string, ttl: number): Promise<number> {
    try {
      return await this.redisClient.expire(key, ttl);
    } catch (error) {
      this.logger.error(`Failed to set expiry on key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Find keys matching a pattern
   * @param pattern Pattern to match (e.g., user:*)
   * @returns Array of matching keys
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redisClient.keys(pattern);
    } catch (error) {
      this.logger.error(`Failed to find keys with pattern: ${pattern}`, error);
      throw error;
    }
  }

  /**
   * Add field to a hash
   * @param key Hash key
   * @param field Field name
   * @param value Value to set
   * @returns 1 if field is new, 0 if field was updated
   */
  async hSet(key: string, field: string, value: any): Promise<number> {
    try {
      const stringValue =
        typeof value !== "string" ? JSON.stringify(value) : value;
      return await this.redisClient.hset(key, field, stringValue);
    } catch (error) {
      this.logger.error(`Failed to set hash field: ${key}:${field}`, error);
      throw error;
    }
  }

  /**
   * Get value of a hash field
   * @param key Hash key
   * @param field Field name
   * @param parse Whether to parse the value as JSON
   * @returns Field value or null if not found
   */
  async hGet<T = any>(
    key: string,
    field: string,
    parse: boolean = false,
  ): Promise<T | null> {
    try {
      const value = await this.redisClient.hget(key, field);

      if (value === null) return null;

      return parse ? JSON.parse(value) : (value as unknown as T);
    } catch (error) {
      this.logger.error(`Failed to get hash field: ${key}:${field}`, error);
      throw error;
    }
  }

  /**
   * Get all fields and values in a hash
   * @param key Hash key
   * @param parse Whether to parse values as JSON
   * @returns Object containing all fields and values
   */
  async hGetAll<T = Record<string, any>>(
    key: string,
    parse: boolean = false,
  ): Promise<T | null> {
    try {
      const hash = await this.redisClient.hgetall(key);

      if (Object.keys(hash).length === 0) return null;

      if (parse) {
        Object.keys(hash).forEach((field) => {
          try {
            hash[field] = JSON.parse(hash[field]);
          } catch (e) {
            // If it's not valid JSON, keep original value
          }
        });
      }

      return hash as unknown as T;
    } catch (error) {
      this.logger.error(`Failed to get all hash fields: ${key}`, error);
      throw error;
    }
  }

  /**
   * Add a member to a sorted set
   * @param key Sorted set key
   * @param value Member value (typically a refresh token)
   * @param options Optional configuration
   * @param options.score Custom score (defaults to current timestamp)
   * @param options.ttl Optional TTL in seconds for the key
   * @returns Number of elements added (1 if new, 0 if updated)
   */
  async zadd(
    key: string,
    value: string,
    options: { score?: number; ttl?: number } = {},
  ): Promise<number> {
    try {
      const { score = Date.now(), ttl } = options;
      const result = await this.redisClient.zadd(key, score, value);

      // Set TTL if provided
      if (ttl !== undefined) {
        await this.redisClient.expire(key, ttl);
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to add member to sorted set: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get the number of members in a sorted set
   * @param key Sorted set key
   * @returns Number of members in the sorted set
   */
  async zcard(key: string): Promise<number> {
    try {
      return await this.redisClient.zcard(key);
    } catch (error) {
      this.logger.error(`Failed to get sorted set cardinality: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get a range of members from a sorted set
   * @param key Sorted set key
   * @param start Start index (0-based)
   * @param stop Stop index (inclusive)
   * @param withScores Whether to return scores along with values
   * @returns Array of members or array of [member, score] pairs if withScores is true
   */
  async zrange(
    key: string,
    start: number,
    stop: number,
    withScores: boolean = false,
  ): Promise<string[] | Array<[string, string]>> {
    try {
      if (withScores) {
        return await this.redisClient.zrange(key, start, stop, "WITHSCORES");
      }
      return await this.redisClient.zrange(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to get range from sorted set: ${key}`, error);
      throw error;
    }
  }

  /**
   * Remove a member from a sorted set
   * @param key Sorted set key
   * @param value Member to remove
   * @returns Number of members removed (0 or 1)
   */
  async zrem(key: string, value: string): Promise<number> {
    try {
      return await this.redisClient.zrem(key, value);
    } catch (error) {
      this.logger.error(
        `Failed to remove member from sorted set: ${key}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Check if a member exists in a sorted set
   * @param key Sorted set key
   * @param value Member to check
   * @returns Boolean indicating if the member exists
   */
  async zismember(key: string, value: string): Promise<boolean> {
    try {
      const score = await this.redisClient.zscore(key, value);
      return score !== null;
    } catch (error) {
      this.logger.error(
        `Failed to check membership in sorted set: ${key}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get members from a sorted set with scores within a range
   * @param key Sorted set key
   * @param min Minimum score (inclusive)
   * @param max Maximum score (inclusive)
   * @param withScores Whether to return scores along with values
   * @returns Array of members or array of [member, score] pairs if withScores is true
   */
  async zrangebyscore(
    key: string,
    min: number,
    max: number,
    withScores: boolean = false,
  ): Promise<string[] | Array<[string, string]>> {
    try {
      if (withScores) {
        return await this.redisClient.zrangebyscore(
          key,
          min,
          max,
          "WITHSCORES",
        );
      }
      return await this.redisClient.zrangebyscore(key, min, max);
    } catch (error) {
      this.logger.error(
        `Failed to get score range from sorted set: ${key}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Remove members from a sorted set with scores within a range
   * @param key Sorted set key
   * @param min Minimum score (inclusive)
   * @param max Maximum score (inclusive)
   * @returns Number of members removed
   */
  async zremrangebyscore(
    key: string,
    min: number,
    max: number,
  ): Promise<number> {
    try {
      return await this.redisClient.zremrangebyscore(key, min, max);
    } catch (error) {
      this.logger.error(
        `Failed to remove score range from sorted set: ${key}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Implement simple caching with automatic expiration
   * @param key Cache key
   * @param fetchFn Function to fetch data if not in cache
   * @param ttl Cache TTL in seconds
   * @returns Cached or freshly fetched data
   */
  async cache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 3600,
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cachedData = await this.redisClient.get(key);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // Fetch fresh data
      const freshData = await fetchFn();

      // Store in cache
      await this.redisClient.set(key, JSON.stringify(freshData), "EX", ttl);

      return freshData;
    } catch (error) {
      this.logger.error(`Cache operation failed for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Flush all keys from the Redis server
   * @returns "OK" if successful
   */
  async flushAll(): Promise<string> {
    try {
      this.logger.warn("Flushing ALL keys from Redis server");
      return await this.redisClient.flushall();
    } catch (error) {
      this.logger.error("Failed to flush all keys", error);
      throw error;
    }
  }

  /**
   * Flush all keys from the current database
   * @returns "OK" if successful
   */
  async flushDb(): Promise<string> {
    try {
      this.logger.warn("Flushing all keys from current database");
      return await this.redisClient.flushdb();
    } catch (error) {
      this.logger.error("Failed to flush database", error);
      throw error;
    }
  }

  /**
   * Get Redis client for direct operations
   * @returns Redis client instance
   */
  getClient(): Redis {
    return this.redisClient;
  }
}
