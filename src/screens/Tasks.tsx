import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootParams } from '../navigation';
import { Task, Priority, today, displayDate } from '../domain';
import { useApp } from '../state';
import { deleteTask, saveTask, toggleTask } from '../services/database';
import {
  Button,
  Chip,
  Empty,
  ErrorMessage,
  Field,
  Heading,
  Page,
  colors,
  message,
  styles,
} from '../ui';

export function TaskCard({ task }: { task: Task }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootParams>>();
  const overdue = !task.done && task.due < today();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${task.title}, ${task.done ? 'concluída' : 'pendente'}, ${task.subject}, prazo ${displayDate(task.due)}`}
      onPress={() => navigation.navigate('Detalhes', { id: task.id })}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[styles.row, { flexWrap: 'nowrap' }]}>
        <View
          style={{
            width: 42,
            height: 42,
            backgroundColor: task.done ? '#E9F6EE' : colors.light,
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={task.done ? 'checkmark' : 'document-text-outline'}
            size={22}
            color={task.done ? colors.green : colors.primary}
          />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.label}>{task.title}</Text>
          <Text style={styles.subtitle}>{task.subject}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </View>
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <Text style={[styles.subtitle, { color: overdue ? colors.red : colors.muted }]}>
          {overdue ? 'Atrasada · ' : ''}
          {displayDate(task.due)}
        </Text>
        <Text
          style={{
            color: task.done
              ? colors.green
              : task.priority === 'Alta'
                ? colors.red
                : colors.primary,
            fontWeight: '600',
            fontSize: 13,
          }}
        >
          {task.done ? 'Concluída' : `Prioridade ${task.priority.toLowerCase()}`}
        </Text>
      </View>
    </Pressable>
  );
}
export function TasksScreen() {
  const { tasks, refresh } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootParams>>();
  const [filter, setFilter] = useState('Todas');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const filtered = tasks.filter(
    (t) =>
      (filter === 'Todas' || (filter === 'Pendentes' ? !t.done : !!t.done)) &&
      `${t.title} ${t.subject}`.toLowerCase().includes(search.toLowerCase()),
  );
  async function reload() {
    setRefreshing(true);
    setError('');
    try {
      await refresh();
    } catch {
      setError('Não foi possível atualizar as tarefas.');
    } finally {
      setRefreshing(false);
    }
  }
  return (
    <Page scroll={false}>
      <Heading title="Suas tarefas" subtitle="Um passo de cada vez, uma entrega de cada vez." />
      <Button title="Nova tarefa" icon="add" onPress={() => navigation.navigate('Editor')} />
      <Field
        label="Buscar por título ou disciplina"
        value={search}
        onChangeText={setSearch}
        placeholder="Ex.: Desenvolvimento mobile"
      />
      <View style={styles.row}>
        {['Todas', 'Pendentes', 'Concluídas'].map((item) => (
          <Chip key={item} title={item} active={filter === item} onPress={() => setFilter(item)} />
        ))}
      </View>
      <ErrorMessage message={error} />
      <FlatList
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskCard task={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshing={refreshing}
        onRefresh={() => {
          void reload();
        }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Empty
            title="Espaço para novos planos"
            body={
              tasks.length
                ? 'Nenhuma tarefa corresponde aos filtros.'
                : 'Toque em Nova tarefa e registre sua primeira entrega.'
            }
          />
        }
      />
    </Page>
  );
}
export function TaskDetailsScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootParams, 'Detalhes'>) {
  const { tasks, user, refresh } = useApp();
  const task = tasks.find((t) => t.id === route.params.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function execute(action: 'toggle' | 'delete') {
    if (!user || !task || busy) return;
    setBusy(true);
    setError('');
    try {
      if (action === 'delete') await deleteTask(user.id, task.id);
      else await toggleTask(user.id, task.id);
      await refresh();
      if (action === 'delete') navigation.goBack();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  if (!task)
    return (
      <Page>
        <Empty title="Tarefa indisponível" body="Volte à lista para consultar suas tarefas." />
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </Page>
    );
  return (
    <Page>
      <Heading title={task.title} subtitle={task.subject} />
      <View style={styles.card}>
        <Text style={styles.label}>Prazo</Text>
        <Text style={styles.section}>{displayDate(task.due)}</Text>
        <Text style={styles.subtitle}>
          Prioridade {task.priority.toLowerCase()} · {task.done ? 'Concluída' : 'Pendente'}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.section}>Anotações</Text>
        <Text selectable style={styles.subtitle}>
          {task.notes || 'Nenhuma anotação adicionada.'}
        </Text>
      </View>
      <ErrorMessage message={error} />
      <Button
        title={task.done ? 'Reabrir tarefa' : 'Marcar como concluída'}
        busy={busy}
        icon="checkmark-circle-outline"
        onPress={() => {
          void execute('toggle');
        }}
      />
      <Button
        title="Editar tarefa"
        busy={busy}
        secondary
        icon="create-outline"
        onPress={() => navigation.navigate('Editor', { id: task.id })}
      />
      <Button
        title="Excluir tarefa"
        busy={busy}
        danger
        icon="trash-outline"
        onPress={() =>
          Alert.alert('Excluir tarefa?', 'Esta ação não pode ser desfeita.', [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Excluir',
              style: 'destructive',
              onPress: () => {
                void execute('delete');
              },
            },
          ])
        }
      />
    </Page>
  );
}
export function TaskEditorScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootParams, 'Editor'>) {
  const { tasks, user, refresh } = useApp();
  const id = route.params?.id;
  const existing = tasks.find((t) => t.id === id);
  const [title, setTitle] = useState(existing?.title ?? route.params?.title ?? '');
  const [subject, setSubject] = useState(existing?.subject ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? route.params?.notes ?? '');
  const [due, setDue] = useState(existing?.due ?? today());
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'Média');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  async function submit() {
    if (!user || busy) return;
    setBusy(true);
    setError('');
    try {
      if (!saved) {
        await saveTask(user.id, { title, subject, notes, due, priority }, id);
        setSaved(true);
      }
      await refresh();
      navigation.goBack();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <Heading
        title={id ? 'Ajuste seu plano' : 'O que vamos aprender?'}
        subtitle="Dê um nome, defina o prazo e tire a ideia do papel."
      />
      <View style={styles.card}>
        <Field
          label="Título"
          value={title}
          onChangeText={setTitle}
          maxLength={120}
          editable={!saved}
        />
        <Field
          label="Disciplina"
          value={subject}
          onChangeText={setSubject}
          maxLength={60}
          editable={!saved}
        />
        <Field
          label="Prazo (AAAA-MM-DD)"
          value={due}
          onChangeText={setDue}
          placeholder="2026-10-24"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          editable={!saved}
        />
        <Text style={styles.label}>Prioridade</Text>
        <View style={styles.row}>
          {(['Baixa', 'Média', 'Alta'] as Priority[]).map((item) => (
            <Chip
              key={item}
              title={item}
              active={priority === item}
              onPress={() => {
                if (!saved) setPriority(item);
              }}
            />
          ))}
        </View>
        <Field
          label="Anotações (opcional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          maxLength={2000}
          editable={!saved}
        />
      </View>
      <ErrorMessage message={error} />
      {saved && (
        <Text style={styles.subtitle}>Tarefa salva. Tente atualizar a lista novamente.</Text>
      )}
      <Button
        title={saved ? 'Atualizar lista' : 'Salvar tarefa'}
        busy={busy}
        icon="checkmark"
        onPress={() => {
          void submit();
        }}
      />
    </Page>
  );
}
