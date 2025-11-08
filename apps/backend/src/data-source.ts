import "reflect-metadata";
import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { config } from "dotenv";
import { join, resolve } from "path";
import { existsSync } from "fs";

const envCandidate =
  process.env.NODE_ENV && process.env.NODE_ENV.trim().length > 0
    ? `.env.${process.env.NODE_ENV}`
    : ".env";

const envPathCandidate = resolve(__dirname, "..", envCandidate);
const envPathFallback = resolve(__dirname, "..", ".env");

const dotenvPath = existsSync(envPathCandidate)
  ? envPathCandidate
  : envPathFallback;

config({
  path: dotenvPath,
});

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseDuration = (value: string | undefined, fallbackMs: number) => {
  if (!value) return fallbackMs;
  const match = value.toString().trim().match(/^(\d+)(ms|s|m|h)?$/i);
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unit = (match[2] || "ms").toLowerCase();

  switch (unit) {
    case "ms":
      return amount;
    case "s":
      return amount * 1000;
    case "m":
      return amount * 60 * 1000;
    case "h":
      return amount * 60 * 60 * 1000;
    default:
      return fallbackMs;
  }
};

const sslMode = (process.env.DB_SSL_MODE ?? "disable").toLowerCase();

const sslConfig =
  sslMode !== "disable"
    ? sslMode === "require" || sslMode === "prefer"
      ? { rejectUnauthorized: false }
      : true
    : undefined;

const dataSourceOptions: PostgresConnectionOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: toNumber(process.env.DB_PORT, 5432),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "postgres",
  synchronize: false,
  logging: false,
  entities: [join(__dirname, "/**/*.entity{.ts,.js}")],
  migrations: [join(__dirname, "/migrations/*{.ts,.js}")],
  migrationsTableName: "typeorm_migrations",
  migrationsTransactionMode: "each",
  extra: {
    max: toNumber(process.env.POOL_SIZE, 10),
    idleTimeoutMillis: parseDuration(process.env.POOL_TIMEOUT, 30000),
    connectionTimeoutMillis: parseDuration(
      process.env.POOL_MAX_CONN_LIFETIME,
      1800000,
    ),
  } as any,
  ssl: sslConfig,
};

export const AppDataSource = new DataSource(dataSourceOptions);
