import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParams } from '../navigation';
import { useApp } from '../state';
import { stats } from '../domain';
import { Button, Empty, Heading, Page, colors, styles } from '../ui';
import { TaskCard } from './Tasks';
export function HomeScreen() {
  const { user, tasks } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootParams>>();
  const summary = stats(tasks);
  const upcoming = tasks.filter((t) => !t.done).slice(0, 3);
  return (
    <Page>
      <Text style={{ color: colors.primary, fontWeight: '800', letterSpacing: 2, fontSize: 12 }}>
        ESTUDA+ / SEU ESPAÇO DE ESTUDO
      </Text>
      <Heading
        title={`Olá, ${user?.name.split(' ')[0]} ☀`}
        subtitle="Pequenos passos hoje. Grandes conquistas amanhã."
      />
      <View
        style={[
          styles.card,
          { backgroundColor: colors.primary, borderColor: colors.primary, padding: 25 },
        ]}
      >
        <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>SEU PROGRESSO</Text>
        <Text style={{ color: '#FFF', fontSize: 44, fontWeight: '800' }}>{summary.progress}%</Text>
        <Text style={{ color: '#FFF', fontSize: 15, lineHeight: 23 }}>
          {summary.done} de {tasks.length} tarefas concluídas. Continue no seu ritmo.
        </Text>
        <View
          style={{ height: 7, borderRadius: 7, backgroundColor: '#273BAF', overflow: 'hidden' }}
        >
          <View style={{ width: `${summary.progress}%`, height: 7, backgroundColor: '#BDE5CB' }} />
        </View>
      </View>
      <View style={styles.row}>
        {[
          { value: summary.pending, label: 'Pendentes', color: colors.primary },
          { value: summary.done, label: 'Concluídas', color: colors.green },
          { value: summary.overdue, label: 'Atrasadas', color: colors.red },
        ].map((item) => (
          <View key={item.label} style={[styles.card, { flex: 1, minWidth: 90, padding: 14 }]}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: item.color }}>{item.value}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{item.label}</Text>
          </View>
        ))}
      </View>
      <Button
        title="Planejar uma tarefa"
        icon="add"
        onPress={() => navigation.navigate('Editor')}
      />
      <Text style={styles.section}>Próximas entregas</Text>
      {upcoming.length ? (
        upcoming.map((task) => <TaskCard key={task.id} task={task} />)
      ) : (
        <Empty
          title={tasks.length ? 'Tudo em dia!' : 'Seu plano começa aqui'}
          body={
            tasks.length
              ? 'Você concluiu todas as suas tarefas. Que tal explorar a biblioteca?'
              : 'Adicione uma tarefa para acompanhar seu progresso.'
          }
        />
      )}
      <Button
        title="Explorar leituras"
        secondary
        icon="book-outline"
        onPress={() => navigation.navigate('Main', { screen: 'Biblioteca' })}
      />
      <Text style={styles.subtitle}>
        Suas tarefas ficam salvas neste aparelho, mesmo sem internet.
      </Text>
    </Page>
  );
}
