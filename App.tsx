import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/state';
import { RootParams, TabParams } from './src/navigation';
import { LoginScreen, RegisterScreen } from './src/screens/Auth';
import { HomeScreen } from './src/screens/Home';
import { TasksScreen, TaskDetailsScreen, TaskEditorScreen } from './src/screens/Tasks';
import { BooksScreen } from './src/screens/Books';
import { ProfileScreen } from './src/screens/Profile';
import { Button, ErrorMessage, Page, colors, styles } from './src/ui';
const Stack = createNativeStackNavigator<RootParams>();
const Tabs = createBottomTabNavigator<TabParams>();
const icons: Record<keyof TabParams, React.ComponentProps<typeof Ionicons>['name']> = {
  Início: 'home-outline',
  Tarefas: 'checkbox-outline',
  Biblioteca: 'book-outline',
  Perfil: 'person-outline',
};
function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: { backgroundColor: '#FFF', borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="Início" component={HomeScreen} />
      <Tabs.Screen name="Tarefas" component={TasksScreen} />
      <Tabs.Screen name="Biblioteca" component={BooksScreen} />
      <Tabs.Screen name="Perfil" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}
function Router() {
  const { user, loading, error, retry } = useApp();
  if (loading)
    return (
      <View style={[styles.page, { alignItems: 'center', justifyContent: 'center', gap: 14 }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.subtitle}>Preparando seu espaço…</Text>
      </View>
    );
  if (error)
    return (
      <Page>
        <ErrorMessage message={error} />
        <Button title="Tentar novamente" onPress={retry} />
      </Page>
    );
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.primary,
          background: colors.bg,
          text: colors.ink,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.ink,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bg },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="Detalhes"
              component={TaskDetailsScreen}
              options={{ title: 'Detalhes da tarefa' }}
            />
            <Stack.Screen
              name="Editor"
              component={TaskEditorScreen}
              options={{ title: 'Planejamento' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Cadastro"
              component={RegisterScreen}
              options={{ title: 'Criar conta' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <View style={[styles.page, { justifyContent: 'center', padding: 28, gap: 16 }]}>
        <Text style={styles.title}>Vamos tentar de novo</Text>
        <Text style={styles.subtitle}>
          Ocorreu um erro inesperado. Feche e abra o aplicativo para recarregar seus dados.
        </Text>
      </View>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ErrorBoundary>
        <AppProvider>
          <Router />
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
