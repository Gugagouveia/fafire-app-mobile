import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Task, User } from '../domain';

/** Export contains academic data only, never credentials or authentication session. */
export async function exportTasks(user: User, tasks: Task[]) {
  const directory = Paths.cache;
  const file = new File(directory, 'estuda-mais-tarefas.json');
  file.create({ overwrite: true });
  file.write(
    JSON.stringify(
      {
        format: 'estuda-mais/v1',
        exportedAt: new Date().toISOString(),
        student: user.name,
        tasks: tasks.map(({ owner, ...task }) => task),
      },
      null,
      2,
    ),
  );
  if (!(await Sharing.isAvailableAsync()))
    throw new Error('O compartilhamento de arquivos não está disponível neste aparelho.');
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Salvar ou compartilhar tarefas',
  });
}
