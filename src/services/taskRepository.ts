import { Task, TaskInput, validateTask } from '../domain';
/** Minimal database port allows the production SQL to be tested against real SQLite. */
export interface TaskDatabase {
  getAllAsync<T>(sql: string, ...params: string[]): Promise<T[]>;
  runAsync(sql: string, ...params: (string | number)[]): Promise<{ changes: number }>;
}
export class TaskRepository {
  constructor(private connection: TaskDatabase) {}
  list(owner: string) {
    return this.connection.getAllAsync<Task>(
      'SELECT * FROM tasks WHERE owner = ? ORDER BY done ASC, due ASC, created DESC',
      owner,
    );
  }
  async save(owner: string, input: TaskInput, id: string, editing: boolean, created: string) {
    const task = validateTask(input);
    if (editing) {
      const result = await this.connection.runAsync(
        'UPDATE tasks SET title=?,subject=?,notes=?,due=?,priority=? WHERE id=? AND owner=?',
        task.title,
        task.subject,
        task.notes,
        task.due,
        task.priority,
        id,
        owner,
      );
      if (!result.changes) throw new Error('Esta tarefa não está mais disponível.');
    } else
      await this.connection.runAsync(
        'INSERT INTO tasks (id,owner,title,subject,notes,due,priority,created) VALUES (?,?,?,?,?,?,?,?)',
        id,
        owner,
        task.title,
        task.subject,
        task.notes,
        task.due,
        task.priority,
        created,
      );
  }
  async toggle(owner: string, id: string) {
    const result = await this.connection.runAsync(
      'UPDATE tasks SET done=1-done WHERE id=? AND owner=?',
      id,
      owner,
    );
    if (!result.changes) throw new Error('Esta tarefa não está mais disponível.');
  }
  async delete(owner: string, id: string) {
    const result = await this.connection.runAsync(
      'DELETE FROM tasks WHERE id=? AND owner=?',
      id,
      owner,
    );
    if (!result.changes) throw new Error('Esta tarefa não está mais disponível.');
  }
}
