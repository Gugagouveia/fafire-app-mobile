# Validação e limites da entrega

**Data:** 13/10/2026

**Ambiente:** Windows, Node.js 22.18.0, Expo SDK 57, TypeScript em modo estrito.

**Responsável pela entrega:** Gustavo Gouveia.

## Verificações automatizadas

| Verificação                            | Resultado                           |
| -------------------------------------- | ----------------------------------- |
| TypeScript `tsc --noEmit`              | Aprovado                            |
| Testes `npm run check`                 | 10 testes aprovados                 |
| Compatibilidade `expo install --check` | Dependências compatíveis            |
| Exportação Android e iOS               | Bundles Hermes gerados; sem APK/IPA |

Os testes cobrem datas impossíveis/anos bissextos, normalização e limites de tarefas, validação de contas, cálculo de progresso/atrasos, resposta externa malformada/URLs inseguras, PBKDF2 comparado à implementação nativa do Node, diferença de salts, CRUD em SQLite real, isolamento entre usuários e SQL injection como texto literal. O adaptador dos testes usa `node:sqlite`; no app, o mesmo repositório SQL usa `expo-sqlite`.

Os testes de SQLite em memória não comprovam integração da ponte nativa nem persistência após reiniciar o aparelho. O exportador do Expo verifica empacotamento e bytecode, sem executar os fluxos em Android/iOS. A compatibilidade de arquivos e compartilhamento precisa de teste físico. Não foram produzidas capturas do aplicativo nativo nem vídeo de demonstração.

## Desempenho

O teste de CRUD em SQLite do computador ficou na ordem de milissegundos; isso **não comprova** a meta de menos de dois segundos no celular. A derivação de uma senha com 600.000 iterações ficou próxima de dois segundos no computador com `@noble/hashes` 1.8.0. As versões 2.x experimentadas apresentaram regressão substancial neste ambiente; a dependência ficou fixada na versão validada. A configuração Metro seleciona explicitamente o módulo browser de crypto para evitar um aviso de exports dessa versão.

Autenticação em aparelhos lentos e pesquisas externas podem exceder dois segundos. Não foi reduzido o fator de derivação para aparentar cumprir desempenho. Cadastro/login exibem carregamento antes da etapa de CPU; ainda podem causar pausa de interface durante a derivação. Uma evolução de produção deve avaliar derivação nativa e autenticação remota, medindo o impacto em aparelhos reais.

## Auditoria de dependências

Após `npm audit fix`, a auditoria apontou **23 ocorrências: 8 moderadas e 15 altas** na árvore instalada. As cadeias reportadas envolvem `braces`/`micromatch`/Metro, `node-forge` e `uuid`/`xcode`, propagadas por pacotes Expo/React Native. A correção automática forçada propunha regressão para Expo 44, incompatível com o projeto; não foi aplicada.

Não se declara a árvore livre de vulnerabilidades. O uso é acadêmico, com dados fictícios. Antes de distribuição de produção, reavaliar avisos, exposição real e atualizações compatíveis dos mantenedores. Execute `npm audit` para consultar o estado atual; contagens podem mudar após novos avisos.

## Roteiro manual obrigatório em aparelho

Marque somente após executar. Estes testes não foram realizados nesta máquina.

| Cenário                             | Resultado esperado                               | Executado |
| ----------------------------------- | ------------------------------------------------ | --------- |
| Cadastro válido e duplicado         | Cria conta e recusa e-mail repetido              | [ ]       |
| Login incorreto / cinco falhas      | Erro e bloqueio temporário                       | [ ]       |
| Login correto / reiniciar app       | Abre dashboard e restaura sessão                 | [ ]       |
| Criar, ler, editar e excluir tarefa | Campos persistem; exclusão confirmada            | [ ]       |
| Concluir e reabrir                  | Métricas e status atualizados                    | [ ]       |
| Duas contas no mesmo aparelho       | Uma não vê tarefas da outra                      | [ ]       |
| Reiniciar em modo avião             | Tarefas e sessão continuam disponíveis           | [ ]       |
| Logout/login/cadastro em modo avião | Fluxos locais funcionam                          | [ ]       |
| Consulta Open Library online        | Mostra resultados e cria tarefa de leitura       | [ ]       |
| Repetir consulta em modo avião      | Mostra cache; termo novo produz erro adequado    | [ ]       |
| Exportação no Perfil                | Abre seletor nativo; arquivo JSON pode ser salvo | [ ]       |
| Inspecionar JSON exportado          | Sem hash, salt, senha, sessão ou owner           | [ ]       |
| Tela pequena, tablet e paisagem     | Conteúdo legível e controles acessíveis          | [ ]       |
| Teclado e leitor de tela            | Campos e ações alcançáveis e identificáveis      | [ ]       |
| Retornar pela navegação do sistema  | Pilha volta à tela anterior                      | [ ]       |

## Medição no aparelho

Registre modelo, sistema, versão do app, quantidade de tarefas e condições de rede. Meça do toque até a confirmação visual. Faça cinco repetições de cada operação local; registre a maior latência. Meta: operações comuns abaixo de 2 segundos. Meça autenticação e API separadamente e relate exceções reais.

| Operação                 | Maior tempo em 5 tentativas | Aparelho |
| ------------------------ | --------------------------- | -------- |
| Abrir lista de tarefas   | Pendente                    | Pendente |
| Criar/editar tarefa      | Pendente                    | Pendente |
| Concluir/reabrir/excluir | Pendente                    | Pendente |
| Abrir detalhes/dashboard | Pendente                    | Pendente |
| Login/cadastro           | Pendente                    | Pendente |
| Pesquisa online/cache    | Pendente                    | Pendente |

## Limites conhecidos

Conta apenas local; sem recuperação de senha, confirmação de e-mail, importação ou sincronização. SQLite sem cifragem de banco. Bloqueio de login apenas em memória. A exportação contém nome e anotações, e deve ser compartilhada conscientemente. Não há envio automático do formulário de entrega.
