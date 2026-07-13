import { env } from '../config/env';

export function temporaryPasswordExpiresAt(
  from = new Date(),
  validityHours = env.TEMP_PASSWORD_EXPIRES_HOURS,
) {
  return new Date(from.getTime() + validityHours * 60 * 60 * 1000);
}

export function isTemporaryPasswordExpired(expiresAt: Date | null, now = new Date()) {
  return expiresAt !== null && expiresAt.getTime() <= now.getTime();
}
