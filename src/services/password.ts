import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';
import { hexToBytes } from '@noble/hashes/utils';
import { hmac } from '@noble/hashes/hmac';

export const LOCAL_VERIFIER_PREFIX = 'local-hmac-v2:';
/** Local-only verifier: its random 256-bit key MUST live in the OS secure store, never SQLite.
 * The key prevents offline password guessing from a leaked SQLite database.
 * This is not a replacement for a password KDF in server authentication.
 */
export function localPasswordVerifier(password: string, salt: string, secret: string) {
  return (
    LOCAL_VERIFIER_PREFIX +
    bytesToHex(hmac(sha256, hexToBytes(secret), utf8ToBytes(JSON.stringify([salt, password]))))
  );
}

// Let loading feedback paint before CPU-intensive derivation. Salt comes from expo-crypto.
export async function passwordHash(password: string, salt: string) {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return bytesToHex(
    await pbkdf2Async(sha256, utf8ToBytes(password), utf8ToBytes(salt), {
      c: 600000,
      dkLen: 32,
      asyncTick: 10,
    }),
  );
}
export function equalHash(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}
