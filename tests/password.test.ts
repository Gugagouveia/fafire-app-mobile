import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pbkdf2Sync } from 'node:crypto';
import { equalHash, passwordHash } from '../src/services/password';
test('password derivation matches native PBKDF2 SHA-256 with 600000 iterations', async () => {
  const password = 'Senha de teste!';
  const salt = 'salt-aleatorio';
  const result = await passwordHash(password, salt);
  assert.equal(result, pbkdf2Sync(password, salt, 600000, 32, 'sha256').toString('hex'));
  assert.notEqual(result, password);
  assert.equal(equalHash(result, result), true);
  assert.equal(equalHash(result, result.slice(0, -1) + (result.endsWith('0') ? '1' : '0')), false);
  assert.equal(equalHash(result, ''), false);
});
test('different salts produce different hashes for the same password', async () => {
  assert.notEqual(
    await passwordHash('Senha de teste!', 'salt-a'),
    await passwordHash('Senha de teste!', 'salt-b'),
  );
});
