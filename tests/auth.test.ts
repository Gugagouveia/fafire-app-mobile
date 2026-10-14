import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, pbkdf2Sync, randomBytes, randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { AuthRepository, CredentialStore } from '../src/services/authRepository';
import {
  localPasswordVerifier,
  LOCAL_VERIFIER_PREFIX,
  passwordHash,
} from '../src/services/password';
import { SCHEMA } from '../src/services/schema';

function fixture() {
  const database = new DatabaseSync(':memory:');
  database.exec(SCHEMA);
  const secrets = new Map<string, string>();
  const credentials: CredentialStore = {
    async getItemAsync(key) {
      return secrets.get(key) ?? null;
    },
    async setItemAsync(key, value) {
      secrets.set(key, value);
    },
    async deleteItemAsync(key) {
      secrets.delete(key);
    },
  };
  const connection = {
    async getFirstAsync<T>(sql: string, ...params: string[]) {
      return (database.prepare(sql).get(...params) as T | undefined) ?? null;
    },
    async runAsync(sql: string, ...params: string[]) {
      return database.prepare(sql).run(...params);
    },
  };
  let legacyCalls = 0;
  const legacy = async (password: string, salt: string) => {
    legacyCalls++;
    return passwordHash(password, salt);
  };
  const repository = () =>
    new AuthRepository(
      connection,
      credentials,
      randomUUID,
      async () => randomBytes(32).toString('hex'),
      legacy,
    );
  return { database, secrets, credentials, repository, legacyCalls: () => legacyCalls };
}

test('new-account registration and login use real SQLite without invoking expensive legacy KDF', async () => {
  const f = fixture();
  try {
    const user = await f.repository().register('Gustavo', ' TESTE@EXAMPLE.COM ', 'senha-de-teste');
    assert.equal(user.email, 'teste@example.com');
    // Recreate the repository to ensure account verification uses stored state, not cached credentials.
    assert.deepEqual(await f.repository().login('teste@example.com', 'senha-de-teste'), user);
    const stored = f.database.prepare('SELECT * FROM users').get()!;
    assert.ok(String(stored.hash).startsWith(LOCAL_VERIFIER_PREFIX));
    assert.ok(!JSON.stringify(stored).includes('senha-de-teste'));
    assert.ok(!JSON.stringify(stored).includes([...f.secrets.values()][0]));
    assert.equal(f.legacyCalls(), 0);
  } finally {
    f.database.close();
  }
});

test('incorrect and unknown credentials are rejected without heavy derivation', async () => {
  const f = fixture();
  try {
    await f.repository().register('Gustavo', 'teste@example.com', 'senha-de-teste');
    await assert.rejects(
      f.repository().login('teste@example.com', 'senha-incorreta'),
      /incorretos/,
    );
    await assert.rejects(
      f.repository().login('desconhecido@example.com', 'senha-de-teste'),
      /incorretos/,
    );
    await assert.rejects(
      f.repository().register('Gustavo', 'TESTE@example.com', 'senha-de-teste'),
      /cadastrado/,
    );
    assert.equal(f.database.prepare('SELECT count(*) AS total FROM users').get()!.total, 1);
    assert.equal(f.legacyCalls(), 0);
  } finally {
    f.database.close();
  }
});

test('a missing secure-store secret cannot bypass password verification', async () => {
  const f = fixture();
  try {
    await f.repository().register('Gustavo', 'teste@example.com', 'senha-de-teste');
    f.secrets.clear();
    await assert.rejects(f.repository().login('teste@example.com', 'senha-de-teste'), /chave/);
  } finally {
    f.database.close();
  }
});

test('failed secure-store writes do not create accounts; failed SQL inserts remove newly saved secrets', async () => {
  const f = fixture();
  try {
    const original = f.credentials.setItemAsync;
    f.credentials.setItemAsync = async () => {
      throw new Error('SecureStore unavailable');
    };
    await assert.rejects(f.repository().register('Gustavo', 'teste@example.com', 'senha-de-teste'));
    assert.equal(f.database.prepare('SELECT count(*) AS total FROM users').get()!.total, 0);
    f.credentials.setItemAsync = original;
    f.database.exec(
      "CREATE TRIGGER reject_user BEFORE INSERT ON users BEGIN SELECT RAISE(ABORT, 'write failed'); END;",
    );
    await assert.rejects(f.repository().register('Gustavo', 'teste@example.com', 'senha-de-teste'));
    assert.equal(f.secrets.size, 0);
  } finally {
    f.database.close();
  }
});

test('legacy accounts migrate only after a valid password and retain their ID and tasks', async () => {
  const f = fixture();
  try {
    const salt = 'legacy-salt';
    const hash = pbkdf2Sync('senha-de-teste', salt, 600000, 32, 'sha256').toString('hex');
    f.database
      .prepare('INSERT INTO users VALUES (?,?,?,?,?)')
      .run('old-id', 'Gustavo', 'teste@example.com', salt, hash);
    f.database
      .prepare(
        'INSERT INTO tasks (id,owner,title,subject,notes,due,priority,created) VALUES (?,?,?,?,?,?,?,?)',
      )
      .run('task', 'old-id', 'Revisar aula', 'Mobile', '', '2026-10-24', 'Alta', '');
    const user = await f.repository().login('teste@example.com', 'senha-de-teste');
    assert.equal(user.id, 'old-id');
    assert.equal(f.legacyCalls(), 1);
    assert.deepEqual(await f.repository().login('teste@example.com', 'senha-de-teste'), user);
    assert.equal(f.legacyCalls(), 1);
    await assert.rejects(f.repository().login('teste@example.com', 'outra-senha'), /incorretos/);
    assert.equal(f.database.prepare('SELECT owner FROM tasks').get()!.owner, 'old-id');
  } finally {
    f.database.close();
  }
});

test('local keyed verifier matches native HMAC-SHA256 and depends on password, salt and secret', () => {
  const secret = randomBytes(32).toString('hex');
  const expected = createHmac('sha256', Buffer.from(secret, 'hex'))
    .update(JSON.stringify(['salt', 'senha-de-teste']))
    .digest('hex');
  assert.equal(
    localPasswordVerifier('senha-de-teste', 'salt', secret),
    LOCAL_VERIFIER_PREFIX + expected,
  );
  assert.notEqual(
    localPasswordVerifier('outra-senha', 'salt', secret),
    LOCAL_VERIFIER_PREFIX + expected,
  );
  assert.notEqual(
    localPasswordVerifier('senha-de-teste', 'outro-salt', secret),
    LOCAL_VERIFIER_PREFIX + expected,
  );
  assert.notEqual(
    localPasswordVerifier('senha-de-teste', 'salt', randomBytes(32).toString('hex')),
    LOCAL_VERIFIER_PREFIX + expected,
  );
});
