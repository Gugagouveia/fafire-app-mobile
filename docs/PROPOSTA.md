# Proposta de projeto — Estuda+

**Autor:** Gustavo Gouveia

**Disciplina:** Desenvolvimento de Aplicativos Móveis — FAFIRE

**Tema permitido:** ferramenta de produtividade para estudantes

**Prazo informado:** 24/10/2026

**Código:** https://github.com/Gugagouveia/fafire-app-mobile

## Problema e público

Estudantes dividem prazos, anotações e leituras entre mensagens e cadernos. Essa fragmentação dificulta perceber atrasos e acompanhar o que já foi concluído. O Estuda+ centraliza o planejamento em um aplicativo que continua útil sem internet.

Persona: estudante universitário que usa Android ou iPhone, cursa diversas disciplinas e precisa registrar entregas durante a aula, inclusive com conexão instável.

## Objetivo

Permitir cadastrar, consultar, editar, concluir, reabrir e excluir tarefas acadêmicas; encontrar referências bibliográficas e transformá-las em atividades; exportar o planejamento para um arquivo consultável fora do aplicativo.

## Escopo desta versão

Contas locais, dashboard, tarefas por disciplina e prazo, prioridades, notas, pesquisa e filtros, catálogo Open Library com cache e exportação JSON. Há oito telas com navegação por pilha e quatro abas. Persistência em SQLite; sessão em SecureStore. Android e iOS são os alvos.

Fora do escopo: sincronização entre aparelhos, autenticação remota, recuperação de senha, notificações push, download de livros, importação do arquivo exportado e publicação em lojas. Armazenamento/compartilhamento de arquivos atende à exigência de recurso móvel.

## Histórias e critérios de aceite

| História                                  | Critério observável                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Como estudante, quero cadastrar uma conta | Nome, e-mail e senha válidos criam conta local; duplicidade e confirmação incorreta produzem erro |
| Quero entrar e sair com segurança         | Credenciais erradas são recusadas; sessão é restaurada; saída impede acessar abas                 |
| Quero organizar uma entrega               | Tarefa válida é salva e continua após reiniciar o app                                             |
| Quero corrigir meu planejamento           | Edição muda os campos e mantém o identificador e status                                           |
| Quero acompanhar progresso                | Concluir/reabrir atualiza métricas; atrasos usam a data local do aparelho                         |
| Quero remover tarefas                     | Exclusão exige confirmação e remove apenas a tarefa da conta atual                                |
| Quero encontrar leituras                  | Pesquisa exibe título/autor e permite preencher uma tarefa de leitura                             |
| Quero estudar offline                     | CRUD e login funcionam offline; consultas já salvas aparecem sem rede                             |
| Quero levar minhas tarefas                | Perfil abre compartilhamento nativo de um JSON sem senha ou sessão                                |

## UX e diferencial

Paleta índigo, superfícies claras, tipografia legível, ações com área mínima de 44 pontos, estados vazios orientados à próxima ação e estados de carregamento. O progresso mostra uma relação simples entre concluídas e total; o fluxo “livro → tarefa” conecta pesquisa bibliográfica à execução.

O layout centraliza o conteúdo em tablets (máximo 760 pontos), permite rolagem e adapta os grupos de ações por quebra de linha. Cores são acompanhadas de texto; tarefas têm rótulos para leitores de tela.

## Etapas e entregáveis

1. Concepção: este documento, requisitos e wireframes (`wireframes.svg`).
2. Prototipação: `prototipo.html`, navegável e com oito estados de tela.
3. Desenvolvimento: código TypeScript, camadas de serviço, testes e workflow GitHub.
4. Preparação da apresentação: roteiro de demonstração e checklist de entrega.

## Critérios de avaliação

Funcionalidade: demonstrar autenticação, CRUD, API e arquivos. Qualidade técnica: explicar separação de responsabilidades, validação, SQL parametrizado e testes. UX: demonstrar telas pequenas, estados vazios e erros. Inovação: mostrar criação de tarefas de leitura e uso offline. Documentação: apresentar os documentos e reconhecer testes pendentes em aparelho.
