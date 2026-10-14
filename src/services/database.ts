import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Book, TaskInput, User } from '../domain';
import { passwordHash } from './password';
import { AuthRepository } from './authRepository';
import { SCHEMA } from './schema';
import { TaskRepository } from './taskRepository';

let database: Promise<SQLite.SQLiteDatabase> | undefined;
const SESSION = 'estudamais.session';
/** One shared connection, parameterized queries, foreign keys and owner-scoped CRUD. */
export function db() {
  if (!database)
    database = (async () => {
      const connection = await SQLite.openDatabaseAsync('estudamais.db');
      await connection.execAsync(SCHEMA);
      return connection;
    })().catch((error) => {
      database = undefined;
      throw error;
    });
  return database;
}
export async function register(name: string, email: string, password: string): Promise<User> {
  return (await authRepository()).register(name, email, password);
}
async function authRepository() {
  return new AuthRepository(
    await db(),
    SecureStore,
    () => Crypto.randomUUID(),
    async () =>
      Array.from(await Crypto.getRandomBytesAsync(32), (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join(''),
    passwordHash,
  );
}
let failedLogins = 0;
let lockedUntil = 0;
export async function login(email: string, password: string): Promise<User> {
  if (Date.now() < lockedUntil)
    throw new Error('Muitas tentativas. Aguarde um minuto antes de tentar novamente.');
  let account: User;
  try {
    account = await (await authRepository()).login(email, password);
  } catch (error) {
    failedLogins++;
    if (failedLogins >= 5) {
      lockedUntil = Date.now() + 60000;
      failedLogins = 0;
    }
    throw error;
  }
  failedLogins = 0;
  await SecureStore.setItemAsync(SESSION, account.id);
  return account;
}
export async function restoreSession() {
  const id = await SecureStore.getItemAsync(SESSION);
  if (!id) return null;
  return await (await db()).getFirstAsync<User>('SELECT id,name,email FROM users WHERE id = ?', id);
}
export async function logout() {
  await SecureStore.deleteItemAsync(SESSION);
}
export async function listTasks(owner: string) {
  return new TaskRepository(await db()).list(owner);
}
export async function saveTask(owner: string, input: TaskInput, id?: string) {
  await new TaskRepository(await db()).save(
    owner,
    input,
    id ?? Crypto.randomUUID(),
    !!id,
    new Date().toISOString(),
  );
}
export async function toggleTask(owner: string, id: string) {
  await new TaskRepository(await db()).toggle(owner, id);
}
export async function deleteTask(owner: string, id: string) {
  await new TaskRepository(await db()).delete(owner, id);
}
export async function cachedBooks(query: string) {
  const result = await (
    await db()
  ).getFirstAsync<{ json: string; updated: string }>(
    'SELECT json,updated FROM book_cache WHERE query=?',
    query,
  );
  if (!result) return null;
  return { books: JSON.parse(result.json) as Book[], updated: result.updated };
}
export async function cacheBooks(query: string, books: Book[]) {
  const connection = await db();
  await connection.runAsync(
    'INSERT OR REPLACE INTO book_cache (query,json,updated) VALUES (?,?,?)',
    query,
    JSON.stringify(books),
    new Date().toISOString(),
  );
  await connection.runAsync(
    'DELETE FROM book_cache WHERE query NOT IN (SELECT query FROM book_cache ORDER BY updated DESC LIMIT 30)',
  );
}
