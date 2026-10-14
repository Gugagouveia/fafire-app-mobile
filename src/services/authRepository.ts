import { User, emailKey, validateAccount } from '../domain';
import { equalHash, localPasswordVerifier, LOCAL_VERIFIER_PREFIX } from './password';

interface AccountDatabase {
  getFirstAsync<T>(sql: string, ...params: string[]): Promise<T | null>;
  runAsync(sql: string, ...params: string[]): Promise<unknown>;
}
export interface CredentialStore {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}
type StoredUser = User & { salt: string; hash: string };
const credentialKey = (id: string) => `estudamais.credential.${id}`;

/** Account orchestration is shared with real-SQLite integration tests. */
export class AuthRepository {
  constructor(
    private connection: AccountDatabase,
    private credentials: CredentialStore,
    private randomId: () => string,
    private randomSecret: () => Promise<string>,
    private legacyHash: (password: string, salt: string) => Promise<string>,
  ) {}

  async register(name: string, email: string, password: string): Promise<User> {
    validateAccount(name, email, password);
    const normalized = emailKey(email);
    if (await this.connection.getFirstAsync('SELECT id FROM users WHERE email=?', normalized))
      throw new Error('Este e-mail já está cadastrado neste aparelho.');
    const user = { id: this.randomId(), name: name.trim(), email: normalized };
    const salt = await this.randomSecret();
    const secret = await this.randomSecret();
    const hash = localPasswordVerifier(password, salt, secret);
    // Persist the protected key first. A failed key write must never create an unusable account.
    await this.credentials.setItemAsync(credentialKey(user.id), secret);
    try {
      await this.connection.runAsync(
        'INSERT INTO users (id,name,email,salt,hash) VALUES (?,?,?,?,?)',
        user.id,
        user.name,
        user.email,
        salt,
        hash,
      );
    } catch (error) {
      await this.credentials.deleteItemAsync(credentialKey(user.id));
      throw error;
    }
    return user;
  }

  async login(email: string, password: string): Promise<User> {
    const row = await this.connection.getFirstAsync<StoredUser>(
      'SELECT * FROM users WHERE email=?',
      emailKey(email),
    );
    if (!row) throw new Error('E-mail ou senha incorretos.');
    if (row.hash.startsWith(LOCAL_VERIFIER_PREFIX)) {
      const secret = await this.credentials.getItemAsync(credentialKey(row.id));
      if (!secret) throw new Error('A chave desta conta não está disponível neste aparelho.');
      if (!equalHash(localPasswordVerifier(password, row.salt, secret), row.hash))
        throw new Error('E-mail ou senha incorretos.');
    } else {
      // Preserve existing accounts. Only the first successful legacy login uses the old KDF.
      if (!equalHash(await this.legacyHash(password, row.salt), row.hash))
        throw new Error('E-mail ou senha incorretos.');
      const secret = await this.randomSecret();
      await this.credentials.setItemAsync(credentialKey(row.id), secret);
      await this.connection.runAsync(
        'UPDATE users SET hash=? WHERE id=?',
        localPasswordVerifier(password, row.salt, secret),
        row.id,
      );
    }
    return { id: row.id, name: row.name, email: row.email };
  }
}
