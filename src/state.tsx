import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, User } from './domain';
import * as storage from './services/database';

type State = {
  user: User | null;
  tasks: Task[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  retry: () => void;
};
const Context = createContext<State | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await storage.db();
      const restored = await storage.restoreSession();
      const items = restored ? await storage.listTasks(restored.id) : [];
      setTasks(items);
      setUser(restored);
    } catch {
      setError('Não foi possível abrir seus dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);
  const refresh = useCallback(async () => {
    if (user) setTasks(await storage.listTasks(user.id));
  }, [user]);
  async function signIn(email: string, password: string) {
    const account = await storage.login(email, password);
    const items = await storage.listTasks(account.id);
    setTasks(items);
    setUser(account);
  }
  async function signOut() {
    await storage.logout();
    setUser(null);
    setTasks([]);
  }
  return (
    <Context.Provider
      value={{
        user,
        tasks,
        loading,
        error,
        refresh,
        signIn,
        signOut,
        retry: () => {
          void bootstrap();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const state = useContext(Context);
  if (!state) throw new Error('AppProvider ausente.');
  return state;
}
