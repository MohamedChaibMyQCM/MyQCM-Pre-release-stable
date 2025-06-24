import { createHash, randomInt } from "crypto";
import { ClientInfo } from "shared/interfaces/client-info.interface";

/**
 * Generates a random one-time password (OTP) of a specified length.
 *
 * @param length - The length of the OTP to generate
 * @returns A string containing the generated OTP
 */
export function generateOTP(length = 6): string {
  return randomInt(10 ** (length - 1), 10 ** length).toString();
}

/**
 * Generates a unique device identifier based on client information.
 *
 * @param clientInfo - An object containing browser, OS, and user agent information
 * @returns A SHA-256 hash of the client information in hexadecimal format
 */
export function generateDeviceId(clientInfo: ClientInfo): string {
  const data = `${clientInfo.browser}-${clientInfo.os}-${clientInfo.agent}`;
  return createHash("sha256").update(data).digest("hex");
}
