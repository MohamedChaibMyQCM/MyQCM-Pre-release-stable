import * as bcrypt from "bcrypt";

/**
 * Hashes a given content securely using bcrypt.
 * @param content - The string to be hashed.
 * @param saltRounds - The number of salt rounds (default: 12).
 * @returns The hashed content as a string.
 */
export async function hashString(
  content: string,
  saltRounds: number = 12,
): Promise<string> {
  if (!content) throw new Error("Content must not be empty");

  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(content, salt);
}

/**
 * Compares a plain text string with a hashed string.
 * @param plainText - The original unencrypted string.
 * @param hashedString - The previously hashed string.
 * @returns A boolean indicating whether the plain text matches the hashed string.
 */
export async function verifyHash(
  plainText: string,
  hashedString: string,
): Promise<boolean> {
  if (!plainText || !hashedString)
    throw new Error("Both plainText and hashedString are required");

  return bcrypt.compare(plainText, hashedString);
}
