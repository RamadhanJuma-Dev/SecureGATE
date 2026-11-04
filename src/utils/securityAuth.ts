import bcrypt from 'bcryptjs';
import { safeStorage } from './storage';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

interface LockoutRecord {
  attempts: number;
  lastAttemptTime: number;
  lockedUntil: number | null;
}

const STORAGE_LOCKOUT_KEY = 'securegate_auth_lockout_';

/**
 * Returns true if the string is already a valid bcrypt hash format ($2a$, $2b$, or $2y$)
 */
export const isBcryptHash = (str: string): boolean => {
  return typeof str === 'string' && /^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(str);
};

/**
 * Hashes a plaintext PIN with bcryptjs using salt rounds 10.
 * If the PIN is already a bcrypt hash, it is returned without re-hashing.
 */
export const hashPin = (pin: string): string => {
  if (!pin) return '';
  if (isBcryptHash(pin)) return pin;
  return bcrypt.hashSync(pin, 10);
};

/**
 * Compares a candidate plaintext PIN against a stored PIN.
 * If stored PIN is a bcrypt hash, validates using bcrypt.compareSync.
 * If stored PIN is legacy plaintext (from older data), validates direct match.
 */
export const verifyPin = (candidatePin: string, storedPin: string): boolean => {
  if (!candidatePin || !storedPin) return false;
  try {
    if (isBcryptHash(storedPin)) {
      return bcrypt.compareSync(candidatePin, storedPin);
    }
    // Legacy fallback for unmigrated data
    return candidatePin === storedPin;
  } catch (err) {
    console.error('Error verifying PIN with bcrypt:', err);
    return false;
  }
};

/**
 * Reads the lockout record for an identifier (badge number, username, or terminal)
 */
export const getLockoutStatus = (
  identifier: string
): { isLocked: boolean; attempts: number; remainingSeconds: number } => {
  const key = `${STORAGE_LOCKOUT_KEY}${identifier.trim().toLowerCase()}`;
  try {
    const raw = safeStorage.getItem(key);
    if (!raw) {
      return { isLocked: false, attempts: 0, remainingSeconds: 0 };
    }
    const record: LockoutRecord = JSON.parse(raw);
    const now = Date.now();

    if (record.lockedUntil && record.lockedUntil > now) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return {
        isLocked: true,
        attempts: record.attempts,
        remainingSeconds,
      };
    }

    // Lockout expired: reset if lockout period passed
    if (record.lockedUntil && record.lockedUntil <= now) {
      safeStorage.removeItem(key);
      return { isLocked: false, attempts: 0, remainingSeconds: 0 };
    }

    // If no recent attempt in last 10 minutes, reset count
    if (now - record.lastAttemptTime > 10 * 60 * 1000) {
      safeStorage.removeItem(key);
      return { isLocked: false, attempts: 0, remainingSeconds: 0 };
    }

    return {
      isLocked: false,
      attempts: record.attempts || 0,
      remainingSeconds: 0,
    };
  } catch {
    return { isLocked: false, attempts: 0, remainingSeconds: 0 };
  }
};

/**
 * Records a failed attempt for an identifier.
 * Increments attempt count and initiates a lockout if MAX_FAILED_ATTEMPTS is reached.
 */
export const recordFailedAttempt = (
  identifier: string
): { isLocked: boolean; attempts: number; remainingSeconds: number } => {
  const key = `${STORAGE_LOCKOUT_KEY}${identifier.trim().toLowerCase()}`;
  const now = Date.now();
  let record: LockoutRecord = {
    attempts: 0,
    lastAttemptTime: now,
    lockedUntil: null,
  };

  try {
    const raw = safeStorage.getItem(key);
    if (raw) {
      record = JSON.parse(raw);
    }
  } catch {
    // start fresh
  }

  record.attempts = (record.attempts || 0) + 1;
  record.lastAttemptTime = now;

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    try {
      safeStorage.setItem(key, JSON.stringify(record));
    } catch {}
    return {
      isLocked: true,
      attempts: record.attempts,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
    };
  }

  try {
    safeStorage.setItem(key, JSON.stringify(record));
  } catch {}

  return {
    isLocked: false,
    attempts: record.attempts,
    remainingSeconds: 0,
  };
};

/**
 * Clears failed attempt records after successful authentication.
 */
export const resetFailedAttempts = (identifier: string): void => {
  const key = `${STORAGE_LOCKOUT_KEY}${identifier.trim().toLowerCase()}`;
  try {
    safeStorage.removeItem(key);
  } catch {}
};
