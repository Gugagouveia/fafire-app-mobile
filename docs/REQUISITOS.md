# Mapeamento dos requisitos da disciplina

| Requisito                              | Implementação / evidência                                              | Situação                                         |
| -------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| Android e/ou iOS                       | React Native + Expo; bundles das duas plataformas                      | Implementado; teste físico pendente              |
| Pelo menos cinco telas                 | Login, Cadastro, Início, Tarefas, Detalhes, Editor, Biblioteca, Perfil | 8 telas                                          |
| Navegação                              | Pilha autenticada e quatro abas; retorno nativo                        | Implementado                                     |
| Persistência                           | SQLite users/tasks/book_cache; SecureStore para sessão                 | Implementado                                     |
| Design responsivo                      | Área segura, rolagem, teclado, largura máxima e grupos flexíveis       | Implementado; inspeção física pendente           |
| Login/cadastro                         | Contas locais, senha derivada, sessão restaurada e logout              | Implementado; sem servidor                       |
| CRUD completo                          | Criar/listar/detalhar/editar/excluir tarefas                           | Testado em SQLite                                |
| API externa                            | Open Library Search API, até 20 livros e cache                         | Implementado; teste de rede em aparelho pendente |
| Recurso do dispositivo                 | Criar arquivo JSON e compartilhar pelo seletor nativo                  | Implementado; teste físico pendente              |
| UI/UX                                  | Dashboard, filtros, feedback, estados vazios e rótulos acessíveis      | Implementado                                     |
| Operações comuns abaixo de 2s          | Índice de tarefas, FlatList, cache e feedback de loading               | Meta a medir; não comprovada no celular          |
| Segurança                              | PBKDF2, salt, SecureStore, validação e SQL parametrizado               | Implementado com limites documentados            |
| Offline básico                         | Cadastro/login e CRUD locais; cache de consultas anteriores            | Implementado; teste em modo avião pendente       |
| Erros/exceções                         | Catch nos fluxos, timeout, retry inicial e ErrorBoundary               | Implementado                                     |
| Documentação do código                 | Tipos, comentários de contratos, arquitetura e README                  | Entregue                                         |
| Concepção                              | Proposta e wireframes                                                  | Entregue                                         |
| Protótipo de alta fidelidade navegável | HTML local com oito telas e fluxo de tarefa                            | Entregue                                         |
| Fonte versionado no GitHub             | Repositório Gustavo Gouveia e workflow de validação                    | Conferir publicação no checklist                 |

Armazenamento de arquivos é a opção escolhida para o requisito de recurso móvel. Notificações push, câmera e geolocalização não são necessárias ao escopo escolhido.
