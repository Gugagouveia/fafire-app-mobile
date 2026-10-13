# Roteiro de apresentação — Gustavo Gouveia

## Demonstração de 6–8 minutos

1. **Problema (40s):** prazos dispersos e dificuldade de acompanhar estudos. Apresente o Estuda+ e o tema de produtividade estudantil.
2. **Concepção (40s):** mostre `PROPOSTA.md`, os wireframes e o protótipo. Explique por que o projeto privilegia uso offline.
3. **Autenticação (50s):** crie conta local com dados de demonstração, mostre validação e entre. Explique que não há servidor nem verificação de e-mail.
4. **CRUD (90s):** crie “Preparar apresentação de Mobile”, disciplina “Desenvolvimento Mobile”, prazo “2026-10-24”, prioridade Alta. Abra detalhes, edite notas e prazo, conclua, veja o dashboard, reabra e exclua com confirmação.
5. **Persistência/offline (60s):** crie outra tarefa; feche e abra o app. Ative modo avião, edite e consulte a tarefa. Faça logout/login sem rede.
6. **API (60s):** reative a rede, busque “programação”, abra um livro e use “Criar tarefa de leitura”. Desligue a rede e repita a mesma consulta para demonstrar o cache.
7. **Recurso móvel (40s):** no Perfil, exporte o JSON e salve pelo compartilhamento. Abra o arquivo para mostrar as tarefas e ausência de credenciais.
8. **Qualidade técnica (60s):** mostre camadas, testes de CRUD/isolamento, TypeScript e pipeline. Reconheça as limitações e os resultados medidos no aparelho.

## Perguntas técnicas esperadas

- Por que SQLite? Persistência real offline, consultas por conta e sem configuração de servidor.
- Como evita misturar usuários? Todas as operações de tarefas incluem `owner`; testes tentam acessar a tarefa de outra conta.
- Como protege senhas? Não guarda senha original; usa PBKDF2-SHA256 com salt aleatório. A sessão fica no SecureStore.
- O que acontece sem rede? CRUD e autenticação continuam; biblioteca oferece consultas previamente salvas.
- O que há de criativo? Fluxo direto de bibliografia para tarefa de leitura e progresso acadêmico local.
- Já cumpre menos de dois segundos? É uma meta que precisa de medição no celular; não confundir tempo de bundle/teste com latência do usuário.

## Preparação

Use somente dados fictícios. Tenha Expo Go/build compatível, rede disponível para a primeira busca e um local para salvar o JSON. Antes de apresentar, execute o checklist em `VALIDACAO.md` e registre modelo do aparelho, versão do sistema e tempos observados.
