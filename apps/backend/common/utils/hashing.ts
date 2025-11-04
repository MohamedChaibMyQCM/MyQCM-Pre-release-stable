import { promisify } from "util";

type BcryptModule = Pick<
  typeof import("bcryptjs"),
  "compare" | "genSalt" | "hash"
>;

function loadBcrypt(): BcryptModule {
  const candidates = ["bcryptjs", "bcrypt"];

  for (const moduleName of candidates) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      return require(moduleName) as BcryptModule;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "MODULE_NOT_FOUND") {
        throw error;
      }
    }
  }

  throw new Error(
    "Unable to load a bcrypt implementation. Install 'bcryptjs' or 'bcrypt'.",
  );
}

const bcryptModule = loadBcrypt();
const genSaltAsync = promisify(bcryptModule.genSalt);
const hashAsync = promisify(bcryptModule.hash);
const compareAsync = promisify(bcryptModule.compare);

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

  const salt = await genSaltAsync(saltRounds);
  return hashAsync(content, salt);
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

  return compareAsync(plainText, hashedString);
}
