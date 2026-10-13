import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';

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
