# Estuda+ · FAFIRE

Aplicativo Android/iOS de produtividade para estudantes, desenvolvido por **Gustavo Gouveia** para a disciplina de Desenvolvimento de Aplicativos Móveis. Organiza tarefas acadêmicas e conecta leituras da Open Library ao planejamento de estudos.

Repositório de entrega: https://github.com/Gugagouveia/fafire-app-mobile

## Executar no celular

Requisitos: Node.js 22.18 ou superior, npm e Expo Go compatível com o SDK 57. Use Android/iOS; a versão web não faz parte deste projeto, pois a persistência e a sessão usam módulos nativos.

```powershell
npm.cmd ci
npm.cmd start
```

No Windows, `npm.cmd` evita o bloqueio de execução de `npm.ps1`. Em outros sistemas, use `npm` normalmente. Abra o Expo Go e leia o QR code exibido no terminal, com computador e celular na mesma rede. Para emulador Android já configurado, execute `npm.cmd run android`. Para simulador iOS, é necessário macOS e Xcode: `npm run ios`.

Se a versão de Expo Go disponível não suportar o SDK usado, faça um development build conforme a [documentação oficial do Expo](https://docs.expo.dev/develop/development-builds/create-a-build/). Não há chave de API, `.env` ou backend remoto a configurar.

Crie sua conta na tela **Criar minha conta**. Não existe usuário ou senha padrão. O cadastro é local e funciona offline. A biblioteca requer internet para consultas novas.

## Funcionalidades

- Oito telas: login, cadastro, início, tarefas, detalhes, editor, biblioteca e perfil.
- CRUD de tarefas com disciplina, prazo, prioridade, notas, conclusão/reabertura e filtros.
- Dashboard com progresso, pendências, atrasos e próximas entregas.
- SQLite persistente e separação das tarefas por usuário.
- Autenticação local com PBKDF2-SHA256, salt aleatório e sessão no SecureStore.
- API Open Library com timeout, validação de resposta e cache das últimas 30 buscas.
- Recurso nativo: exportação JSON pelo sistema de arquivos e compartilhamento do celular.
- Layout adaptável, teclado tratado, área segura, rótulos acessíveis e mensagens de erro.

## Entregáveis

| Etapa                                | Arquivo                                        |
| ------------------------------------ | ---------------------------------------------- |
| Concepção e escopo                   | [Proposta](docs/PROPOSTA.md)                   |
| Wireframes iniciais                  | [Wireframes](docs/wireframes.svg)              |
| Protótipo navegável                  | [Abrir HTML no navegador](docs/prototipo.html) |
| Arquitetura e documentação do código | [Arquitetura](docs/ARQUITETURA.md)             |
| Mapeamento dos requisitos            | [Requisitos](docs/REQUISITOS.md)               |
| Testes e limitações                  | [Validação](docs/VALIDACAO.md)                 |
| Roteiro para apresentação            | [Apresentação](docs/APRESENTACAO.md)           |
| Checklist de entrega em 24/10/2026   | [Entrega](docs/ENTREGA.md)                     |

O HTML é um protótipo visual com dados fictícios, separado do aplicativo nativo. Baixe o arquivo e abra localmente; o GitHub exibe seu código, sem executar o protótipo.

## Verificar e gerar build

```powershell
npm.cmd run check
npx.cmd expo install --check
npx.cmd expo export --platform android --platform ios
```

A exportação valida os bundles JavaScript/Hermes; **não gera APK/IPA** nem substitui teste em dispositivo. A integração contínua executa esses checks no GitHub.

Para gerar um APK de demonstração usando uma conta Expo:

```powershell
npx.cmd eas-cli login
npx.cmd eas-cli build --platform android --profile preview
```

O serviço solicitará associação do projeto à conta. O arquivo `eas.json` já define APK interno. iOS exige configuração de assinatura e conta Apple para distribuição. Nenhum APK/IPA foi produzido nesta entrega local.

## Estrutura

```text
App.tsx                  Navegação, abas e proteção contra erro de renderização
src/domain.ts            Tipos, validação, datas, métricas e parsing da API
src/state.tsx            Sessão e estado das tarefas
src/ui.tsx               Componentes e identidade visual
src/screens/             Telas do aplicativo
src/services/            SQLite, autenticação, livros e exportação
tests/                   Testes de domínio, criptografia e CRUD real em SQLite
docs/                    Proposta, protótipo, wireframes e entrega
```

## Referências e limites

O exemplo [AgroFamília](https://github.com/DIOGOBRODRIGUES/agrofamiliaapp), commit `6991129ba36af1a5ae0b283f406b9c44aca8c549`, orientou a estrutura Expo + abas + autenticação. A implementação do Estuda+ foi criada para este tema; a cópia consultada em `reference/` está excluída do versionamento.

Consulte [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/), [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/), [FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/) e [Open Library Search API](https://openlibrary.org/dev/docs/api/search).

Este é um projeto acadêmico com autenticação no aparelho, sem verificação de e-mail, recuperação de senha ou sincronização. O SQLite não é cifrado; o login organiza o acesso pela interface, mas não protege contra inspeção em aparelho comprometido. Veja a documentação de segurança e a auditoria de dependências em `docs/VALIDACAO.md` antes de uso com dados reais.
