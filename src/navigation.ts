import { NavigatorScreenParams } from '@react-navigation/native';
export type TabParams = {
  Início: undefined;
  Tarefas: undefined;
  Biblioteca: undefined;
  Perfil: undefined;
};
export type RootParams = {
  Login: undefined;
  Cadastro: undefined;
  Main: NavigatorScreenParams<TabParams>;
  Detalhes: { id: string };
  Editor: { id?: string; title?: string; notes?: string } | undefined;
};
