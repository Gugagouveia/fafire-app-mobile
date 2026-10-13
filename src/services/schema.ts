/** Version 1 schema. Future upgrades must use ordered migrations instead of resetting data. */
export const SCHEMA = `PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, salt TEXT NOT NULL, hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, subject TEXT NOT NULL, notes TEXT NOT NULL, due TEXT NOT NULL, priority TEXT NOT NULL CHECK(priority IN ('Alta','Média','Baixa')), done INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0,1)), created TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS tasks_owner_due ON tasks(owner, done, due);
CREATE TABLE IF NOT EXISTS book_cache (query TEXT PRIMARY KEY, json TEXT NOT NULL, updated TEXT NOT NULL);
PRAGMA user_version = 1;`;
