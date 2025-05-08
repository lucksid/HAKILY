import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hash a password
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * @param plainPassword Plain text password
 * @param hashedPassword Hashed password
 * @returns True if passwords match
 */
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
