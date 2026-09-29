// Serves: R15
import * as Crypto from 'expo-crypto';

/**
 * Hash phone number with a salt using SHA-256.
 * The raw phone number is never stored in persistent storage or transmitted.
 */
export async function hashPhoneNumber(phone: string, salt = 'kabadiwala_salt_2026'): Promise<string> {
  const cleanPhone = phone.trim().replace(/\D/g, '');
  if (!cleanPhone) return '';
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${cleanPhone}`,
  );
}
