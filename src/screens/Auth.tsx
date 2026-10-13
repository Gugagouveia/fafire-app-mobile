import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootParams } from '../navigation';
import { useApp } from '../state';
import { register } from '../services/database';
import { Button, ErrorMessage, Field, Heading, Page, colors, message, styles } from '../ui';

export function LoginScreen({ navigation }: NativeStackScreenProps<RootParams, 'Login'>) {
  const { signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    if (busy) return;
    if (!email.trim() || !password || password.length > 128) {
      setError('Preencha seu e-mail e sua senha (até 128 caracteres).');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
      setPassword('');
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <View style={{ paddingTop: 28, gap: 18 }}>
        <View style={[styles.row, { gap: 10 }]}>
          <Ionicons name="school" color={colors.primary} size={32} />
          <Text style={[styles.section, { color: colors.primary }]}>estuda+</Text>
        </View>
        <Heading
          title="Seu próximo passo começa aqui."
          subtitle="Organize as entregas. Encontre boas leituras. Abra espaço para aprender."
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.section}>Bem-vindo de volta</Text>
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          maxLength={254}
        />
        <Field
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          maxLength={128}
        />
        <ErrorMessage message={error} />
        <Button
          title="Entrar"
          busy={busy}
          onPress={() => {
            void submit();
          }}
        />
        <Button
          title="Criar minha conta"
          secondary
          busy={busy}
          onPress={() => navigation.navigate('Cadastro')}
        />
      </View>
      <View style={[styles.row, { justifyContent: 'center' }]}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.green} />
        <Text style={styles.subtitle}>Seus estudos disponíveis offline</Text>
      </View>
      <Text style={styles.subtitle}>
        Conta local: o cadastro e as tarefas ficam neste aparelho. Não há sincronização entre
        dispositivos.
      </Text>
    </Page>
  );
}
export function RegisterScreen({ navigation }: NativeStackScreenProps<RootParams, 'Cadastro'>) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  async function submit() {
    if (busy) return;
    if (password !== confirm) {
      setError('As senhas precisam ser iguais.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await register(name, email, password);
      setPassword('');
      setConfirm('');
      setSuccess(true);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  if (success)
    return (
      <Page>
        <Heading
          title="Tudo pronto!"
          subtitle="Sua conta foi criada neste aparelho. Entre com seu e-mail e senha para começar."
        />
        <Button title="Ir para o login" onPress={() => navigation.goBack()} />
      </Page>
    );
  return (
    <Page>
      <Heading
        title="Um lugar para seus planos."
        subtitle="Crie sua conta e organize sua rotina acadêmica."
      />
      <View style={styles.card}>
        <Field
          label="Nome"
          value={name}
          onChangeText={setName}
          autoComplete="name"
          maxLength={80}
        />
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          maxLength={254}
        />
        <Field
          label="Senha (mínimo 10 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          maxLength={128}
        />
        <Field
          label="Confirmar senha"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          maxLength={128}
        />
        <ErrorMessage message={error} />
        <Button
          title="Criar conta"
          busy={busy}
          onPress={() => {
            void submit();
          }}
        />
      </View>
      <Text style={styles.subtitle}>
        Seu e-mail identifica a conta local; ele não será verificado nem enviado a um servidor. Use
        uma senha exclusiva para este projeto.
      </Text>
    </Page>
  );
}
