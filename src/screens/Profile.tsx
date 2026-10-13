import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state';
import { exportTasks } from '../services/export';
import { Button, ErrorMessage, Heading, Page, colors, message, styles } from '../ui';
export function ProfileScreen() {
  const { user, tasks, signOut } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function exportData() {
    if (!user || busy) return;
    setBusy(true);
    setError('');
    try {
      await exportTasks(user, tasks);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function leave() {
    setBusy(true);
    setError('');
    try {
      await signOut();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <Heading title="Seu perfil" subtitle="Seu espaço, seus dados, seu ritmo." />
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 30 }]}>
        <View
          style={{
            width: 72,
            height: 72,
            backgroundColor: colors.light,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 32, fontWeight: '800', color: colors.primary }}>
            {user?.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.section}>{user?.name}</Text>
        <Text style={styles.subtitle}>{user?.email}</Text>
        <Text style={{ color: colors.green, fontWeight: '600' }}>
          Conta local · {tasks.length} tarefas
        </Text>
      </View>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="download-outline" size={24} color={colors.primary} />
          <Text style={styles.section}>Leve seus planos com você</Text>
        </View>
        <Text style={styles.subtitle}>
          Exporte suas tarefas em JSON e escolha onde salvar ou compartilhar o arquivo. Ele contém
          seu nome e suas anotações.
        </Text>
        <Button
          title="Exportar minhas tarefas"
          icon="share-outline"
          busy={busy}
          onPress={() => {
            void exportData();
          }}
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.section}>Privacidade e uso offline</Text>
        <Text style={styles.subtitle}>
          Login, cadastro e tarefas funcionam sem internet. O catálogo de livros precisa de conexão
          para novas buscas. Somente o termo da busca é enviado à Open Library.
        </Text>
        <Text style={styles.subtitle}>
          Os dados são locais. Desinstalar o aplicativo pode apagar sua conta e suas tarefas. A
          exportação é para consulta; não há importação ou sincronização nesta versão.
        </Text>
      </View>
      <ErrorMessage message={error} />
      <Button
        title="Sair da conta"
        secondary
        busy={busy}
        icon="log-out-outline"
        onPress={() =>
          Alert.alert('Sair da conta?', 'Suas tarefas continuarão salvas neste aparelho.', [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Sair',
              onPress: () => {
                void leave();
              },
            },
          ])
        }
      />
      <Text style={[styles.subtitle, { textAlign: 'center' }]}>
        Estuda+ 1.0 · Projeto de Desenvolvimento Mobile
      </Text>
    </Page>
  );
}
