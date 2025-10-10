// client-info.util.ts
import { Request } from "express";
import { lookup } from "geoip-lite";
import { getClientIp } from "request-ip";
import { getEnvOrFatal } from "./env.util";
import { ClientInfo } from "shared/interfaces/client-info.interface";
import { InternalServerErrorException, Logger } from "@nestjs/common";
import { parse } from "useragent";

/**
 * Extracts client information from a request object
 * @param req Express Request object
 * @param localIpAddress Optional override for local IP addresses
 * @returns ClientInfo object containing IP, browser, OS and location data
 */
export async function extractClientInfo(req: Request): Promise<ClientInfo> {
  try {
    const localIpAddress = getEnvOrFatal<string>("APP_IP");
    // Get client IP
    const client_ip = getClientIp(req) || "127.0.0.1";
    const final_ip =
      isLocalAddress(client_ip) && localIpAddress ? localIpAddress : client_ip;

    // Parse user agent
    const agent = parse(req.headers["user-agent"] || "");

    // Get geolocation info
    const ipInfo = lookup(final_ip) || null;
    // Construct and return client info
    return {
      ip: final_ip,
      browser: agent.family,
      os: agent.os.family,
      agent: agent.source,
      ipInfo: {
        city: ipInfo?.city || "unknown",
        country: ipInfo?.country || "unknown",
        region: ipInfo?.region || "unknown",
        timezone: ipInfo?.timezone || "unknown",
      },
    };
  } catch (error) {
    Logger.error(`Error extracting client info: ${error}`);
    throw new InternalServerErrorException("Error extracting client info");
  }
}
export const isLocalAddress = (ip: string): boolean => {
  const localAddressRegex = /^(127\.0\.0\.1|::1|fe80(:1)?::1(%.*)?)$/i;

  return localAddressRegex.test(ip);
};
