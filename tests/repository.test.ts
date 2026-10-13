import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { SCHEMA } from '../src/services/schema';
import { TaskRepository, TaskDatabase } from '../src/services/taskRepository';
import { TaskInput } from '../src/domain';
function fixture() {
  const database = new DatabaseSync(':memory:');
  database.exec(SCHEMA);
  const insert = database.prepare('INSERT INTO users VALUES (?,?,?,?,?)');
  insert.run('alice', 'Alice', 'alice@example.com', 'salt', 'hash');
  insert.run('bob', 'Bob', 'bob@example.com', 'salt', 'hash');
  const adapter: TaskDatabase = {
    async getAllAsync<T>(sql: string, ...params: string[]) {
      return database.prepare(sql).all(...params) as T[];
    },
    async runAsync(sql: string, ...params: (string | number)[]) {
      return { changes: Number(database.prepare(sql).run(...params).changes) };
    },
  };
  return { database, repository: new TaskRepository(adapter) };
}
const task: TaskInput = {
  title: 'Revisar mobile',
  subject: 'Mobile',
  notes: '',
  priority: 'Alta',
  due: '2026-10-24',
};
test('real SQLite CRUD persists edits, completion, reopening and deletion', async () => {
  const { database, repository } = fixture();
  try {
    await repository.save('alice', task, '1', false, '2026-10-13');
    assert.equal((await repository.list('alice'))[0].title, task.title);
    await repository.save('alice', { ...task, title: 'Revisar React Native' }, '1', true, '');
    assert.equal((await repository.list('alice'))[0].title, 'Revisar React Native');
    await repository.toggle('alice', '1');
    assert.equal((await repository.list('alice'))[0].done, 1);
    await repository.toggle('alice', '1');
    assert.equal((await repository.list('alice'))[0].done, 0);
    await repository.delete('alice', '1');
    assert.equal((await repository.list('alice')).length, 0);
  } finally {
    database.close();
  }
});
test('another account cannot read, edit, toggle or delete owned tasks', async () => {
  const { database, repository } = fixture();
  try {
    await repository.save('alice', task, '1', false, '2026-10-13');
    assert.deepEqual(await repository.list('bob'), []);
    await assert.rejects(repository.save('bob', { ...task, title: 'Changed' }, '1', true, ''));
    await assert.rejects(repository.toggle('bob', '1'));
    await assert.rejects(repository.delete('bob', '1'));
    assert.equal((await repository.list('alice'))[0].title, task.title);
  } finally {
    database.close();
  }
});
test('SQL injection text is stored literally and invalid dates never persist', async () => {
  const { database, repository } = fixture();
  try {
    await repository.save('alice', { ...task, title: "'); DROP TABLE tasks; --" }, '1', false, '');
    assert.equal((await repository.list('alice'))[0].title, "'); DROP TABLE tasks; --");
    await assert.rejects(repository.save('alice', { ...task, due: '2026-02-30' }, '2', false, ''));
    assert.equal((await repository.list('alice')).length, 1);
    await assert.rejects(repository.save('missing', task, '3', false, ''));
  } finally {
    database.close();
  }
});
