import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  emailKey,
  parseBooks,
  stats,
  today,
  validDate,
  validateAccount,
  validateTask,
  Task,
} from '../src/domain';
test('calendar validation rejects normalized invalid dates and accepts leap years', () => {
  assert.equal(validDate('2026-02-29'), false);
  assert.equal(validDate('2024-02-29'), true);
  assert.equal(validDate('2026-04-31'), false);
  assert.equal(validDate('24/10/2026'), false);
  assert.equal(validDate('2026-10-24'), true);
});
test('task input is normalized and invalid fields cannot reach persistence', () => {
  const input = {
    title: '  Revisar aula  ',
    subject: ' Mobile ',
    notes: '  Capítulo 2  ',
    due: '2026-10-24',
    priority: 'Alta' as const,
  };
  assert.deepEqual(validateTask(input), {
    ...input,
    title: 'Revisar aula',
    subject: 'Mobile',
    notes: 'Capítulo 2',
  });
  for (const invalid of [
    { title: ' ' },
    { subject: '' },
    { title: 'a'.repeat(121) },
    { notes: 'a'.repeat(2001) },
    { due: '2026-13-10' },
  ])
    assert.throws(() => validateTask({ ...input, ...invalid }));
});
test('accounts require valid emails and sufficiently long passwords', () => {
  assert.equal(emailKey(' ALUNO@EXEMPLO.COM '), 'aluno@exemplo.com');
  assert.doesNotThrow(() => validateAccount('Ana', 'aluno@example.com', 'uma-senha-longa'));
  assert.throws(() => validateAccount('A', 'aluno@example.com', 'uma-senha-longa'));
  assert.throws(() => validateAccount('Ana', 'invalido', 'uma-senha-longa'));
  assert.throws(() => validateAccount('Ana', 'aluno@example.com', '123'));
});
test('progress counts completed tasks and excludes them from overdue', () => {
  const make = (id: string, done: number, due: string): Task => ({
    id,
    done,
    due,
    owner: 'a',
    title: 'Tarefa',
    subject: 'Mobile',
    notes: '',
    priority: 'Média',
    created: '',
  });
  assert.deepEqual(
    stats([make('1', 1, '2000-01-01'), make('2', 0, '2000-01-01'), make('3', 0, today())]),
    { done: 1, pending: 2, overdue: 1, progress: 33 },
  );
  assert.deepEqual(stats([]), { done: 0, pending: 0, overdue: 0, progress: 0 });
});
test('external API parsing rejects invalid payloads, unsafe keys and duplicates', () => {
  assert.throws(() => parseBooks({ error: 'offline' }));
  assert.deepEqual(
    parseBooks({
      docs: [
        null,
        { key: '//evil.com', title: 'Unsafe' },
        { key: '/works/OL1W', title: 'Livro', author_name: ['Ana', 12] },
        { key: '/works/OL1W', title: 'Livro', author_name: ['Ana'] },
      ],
    }),
    [{ key: '/works/OL1W', title: 'Livro', author: 'Ana', year: undefined }],
  );
  assert.deepEqual(parseBooks({ docs: [] }), []);
  assert.equal(
    parseBooks({
      docs: Array.from({ length: 30 }, (_, i) => ({ key: `/works/OL${i}W`, title: 'Livro' })),
    }).length,
    20,
  );
});
