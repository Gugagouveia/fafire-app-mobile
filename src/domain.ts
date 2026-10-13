/** Pure domain rules shared by the screens, persistence and automated tests. */
export type User = { id: string; name: string; email: string };
export type Priority = 'Alta' | 'Média' | 'Baixa';
export type Task = {
  id: string;
  owner: string;
  title: string;
  subject: string;
  notes: string;
  due: string;
  priority: Priority;
  done: number;
  created: string;
};
export type TaskInput = Pick<Task, 'title' | 'subject' | 'notes' | 'due' | 'priority'>;
export type Book = { key: string; title: string; author: string; year?: number };
export function emailKey(email: string) {
  return email.trim().toLowerCase();
}
export function validateAccount(name: string, email: string, password: string) {
  if (name.trim().length < 2 || name.trim().length > 80)
    throw new Error('Informe um nome entre 2 e 80 caracteres.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailKey(email)) || email.length > 254)
    throw new Error('Informe um e-mail válido.');
  if (password.length < 10 || password.length > 128)
    throw new Error('Use uma senha entre 10 e 128 caracteres.');
}
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validateTask(input: TaskInput): TaskInput {
  if (!input.title.trim() || input.title.trim().length > 120)
    throw new Error('O título deve ter entre 1 e 120 caracteres.');
  if (!input.subject.trim() || input.subject.trim().length > 60)
    throw new Error('A disciplina deve ter entre 1 e 60 caracteres.');
  if (input.notes.length > 2000) throw new Error('As anotações podem ter até 2.000 caracteres.');
  if (!validDate(input.due)) throw new Error('Informe uma data válida no formato AAAA-MM-DD.');
  if (!['Alta', 'Média', 'Baixa'].includes(input.priority))
    throw new Error('Selecione uma prioridade válida.');
  return {
    ...input,
    title: input.title.trim(),
    subject: input.subject.trim(),
    notes: input.notes.trim(),
  };
}
export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function displayDate(value: string) {
  return value.split('-').reverse().join('/');
}
export function stats(tasks: Task[]) {
  const done = tasks.filter((t) => t.done === 1).length;
  return {
    done,
    pending: tasks.length - done,
    overdue: tasks.filter((t) => !t.done && t.due < today()).length,
    progress: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
  };
}
/** Remote responses are untrusted: only retain fields that the app can display safely. */
export function parseBooks(payload: unknown): Book[] {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('docs' in payload) ||
    !Array.isArray(payload.docs)
  )
    throw new Error('A biblioteca retornou uma resposta inválida.');
  const books = new Map<string, Book>();
  for (const item of payload.docs) {
    if (
      !item ||
      typeof item.key !== 'string' ||
      !/^\/works\/OL\d+W$/.test(item.key) ||
      typeof item.title !== 'string'
    )
      continue;
    books.set(item.key, {
      key: item.key,
      title: item.title.slice(0, 300),
      author: Array.isArray(item.author_name)
        ? item.author_name
            .filter((a: unknown) => typeof a === 'string')
            .slice(0, 3)
            .join(', ')
            .slice(0, 300) || 'Autor não informado'
        : 'Autor não informado',
      year: Number.isInteger(item.first_publish_year) ? item.first_publish_year : undefined,
    });
  }
  return [...books.values()].slice(0, 20);
}
