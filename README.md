# Connexa — modelo de repositório (Node.js + React)

Repositório-modelo para as equipes que escolheram **TypeScript e Node.js** no back-end do Connexa. A partir dele, cada equipe cria, na organização do GitHub da própria equipe, o seu `<repositorio-da-equipe>` — com nome escolhido pela equipe — e já recebe a infraestrutura pronta: arquitetura modular, banco de dados, testes, CI, ambiente no GitHub Codespaces e a conexão do agente de IA com o Azure Boards.

> **O que este modelo não traz:** nenhuma funcionalidade do Connexa. Os módulos estão vazios e são preenchidos sprint a sprint, a partir das Tasks do Azure Boards. As duas fatias incluídas (situação do sistema e estudante simulado) são exemplos de estrutura e apoio ao desenvolvimento.

| Parte | Tecnologia |
|---|---|
| Back-end | Node.js 24 (LTS) · TypeScript · NestJS 12 · Prisma 7 + Prisma Migrate · `@nestjs/event-emitter` · `@nestjs/swagger` · `class-validator` |
| Banco de dados | PostgreSQL 17, em contêiner |
| Front-end | React 19 · TypeScript · Vite · React Router · TanStack Query · React Hook Form + Zod |
| Testes | Vitest + Supertest (aceitação na API) · eslint-plugin-boundaries e teste de arquitetura (fronteiras) · Vitest + Testing Library |
| Ambiente | GitHub Codespaces (Dev Container) ou máquina local com Docker |
| Integração contínua | GitHub Actions |

---

## Sumário

1. [Estrutura do repositório](#1-estrutura-do-repositório)
2. [Começar a trabalhar](#2-começar-a-trabalhar)
3. [Comandos do dia a dia](#3-comandos-do-dia-a-dia)
4. [Arquitetura](#4-arquitetura)
5. [Banco de dados](#5-banco-de-dados)
6. [Estudante simulado](#6-estudante-simulado)
7. [Testes e verificação](#7-testes-e-verificação)
8. [Agente de IA e Azure Boards](#8-agente-de-ia-e-azure-boards)
9. [Configuração depois de criar o repositório da equipe](#9-configuração-depois-de-criar-o-repositório-da-equipe)
10. [Decisões deste modelo](#10-decisões-deste-modelo)
11. [Solução de problemas](#11-solução-de-problemas)

---

## 1. Estrutura do repositório

```
<repositorio-da-equipe>/
├── AGENTS.md                      instruções para agentes de IA (Codex e outros)
├── .github/
│   ├── copilot-instructions.md    cópia idêntica do AGENTS.md (GitHub Copilot)
│   ├── pull_request_template.md   evidências exigidas em todo pull request
│   └── workflows/ci.yml           CI: back-end, front-end e instruções sincronizadas
├── .devcontainer/                 ambiente do GitHub Codespaces (Node e PostgreSQL)
├── .vscode/mcp.json               conexão do GitHub Copilot com o Azure Boards (MCP remoto)
├── .codex/config.toml             conexão do Codex com o Azure Boards (MCP local)
├── docker-compose.yml             PostgreSQL para desenvolvimento e testes
├── verificar · verificar.ps1      rodam localmente tudo o que o CI roda
├── backend/                       API — monolito modular em NestJS
│   ├── prisma/                    schema.prisma, migrações e LEIA-ME.md
│   ├── src/app.module.ts          monta a aplicação a partir dos módulos
│   ├── src/modulos/<modulo>/      um módulo por pasta (index.ts, <modulo>.module.ts, internal/)
│   └── test/                      apoio aos testes de aceitação e preparação do banco de teste
├── frontend/                      SPA em React, organizada por features
├── docs/
│   ├── adr/                       registros de decisão de arquitetura
│   └── exemplo/                   cenários Gherkin das fatias de exemplo
└── infra/postgres/init/           cria o banco de teste na primeira inicialização
```

---

## 2. Começar a trabalhar

### Opção A — GitHub Codespaces (recomendada)

Nada precisa ser instalado na máquina: Node.js 24 e PostgreSQL já vêm no ambiente.

1. No repositório da equipe, clique em **Code › Codespaces › Create codespace on main**.
2. Aguarde a criação. Na primeira vez, o script `.devcontainer/pos-criacao.sh` baixa as dependências, o que leva alguns minutos.
3. No terminal do Codespace, rode `./verificar`. Tudo deve terminar com **"Verificação concluída sem falhas."**
4. Suba a aplicação em dois terminais:
   ```bash
   cd backend && npm run dev
   ```
   ```bash
   cd frontend && npm run dev
   ```
5. A aba **Ports** do VS Code mostra os endereços. A interface (porta 5173) abre no navegador.

> **Cota do Codespaces.** Contas com o GitHub Student Developer Pack têm uma cota mensal de horas de uso. Pare o Codespace quando não estiver usando (**Codespaces › Stop current codespace**); ele também para sozinho depois de um período sem atividade.

### Opção B — máquina local (Windows, Linux ou macOS)

**Pré-requisitos:** Node.js 24, Docker Desktop (ou Docker Engine) e VS Code com as extensões recomendadas (o VS Code oferece instalá-las ao abrir a pasta).

```powershell
docker compose up -d db          # sobe o PostgreSQL
.\verificar.ps1                  # Windows (no Linux/macOS: ./verificar)
cd backend; npm run dev
cd frontend; npm install; npm run dev
```

### Endereços

| Endereço | O que é |
|---|---|
| <http://localhost:5173> | Interface (o Vite repassa `/api` para o back-end) |
| <http://localhost:8080/swagger-ui> | Contrato da API, navegável |
| <http://localhost:8080/v3/api-docs> | Contrato da API em JSON (OpenAPI) |
| `localhost:5432` | PostgreSQL — usuário `connexa`, senha `connexa`, bancos `connexa` e `connexa_teste` |

---

## 3. Comandos do dia a dia

| Ação | Comando |
|---|---|
| Verificar tudo (o mesmo que o CI) | `./verificar` · Windows: `.\verificar.ps1` |
| Só o back-end / só o front-end | `./verificar backend` · `./verificar frontend` |
| Subir a API (aplica as migrações antes) | `cd backend && npm run dev` |
| Subir a interface | `cd frontend && npm run dev` |
| Testes em modo contínuo | `npm run test:observar`, em `backend/` ou `frontend/` |
| Criar uma migração | `cd backend && npm run banco:nova-migracao -- <nome>` (ver `backend/prisma/LEIA-ME.md`) |
| Apagar os dados e recomeçar o banco | `docker compose down -v && docker compose up -d db` |

> **`./verificar` é o `<comando-de-verificacao>`** citado no roteiro da Atividade de Sprint e nas Tasks prontas para agente.

---

## 4. Arquitetura

**Monolito modular com fatias verticais + SPA**, conforme a proposta de arquitetura da disciplina. O ADR-001 de cada equipe registra a adoção ou a adaptação.

### Módulos do back-end

| Pasta | Território | Situação no modelo |
|---|---|---|
| `identidade` | Quem é o estudante atual | Estudante **simulado** (ver seção 6) |
| `perfil` | Perfil acadêmico | Vazio |
| `grupos` | Grupos de estudo e participação | Vazio |
| `encontros` | Encontros dos grupos | Vazio |
| `acompanhamento` | Atividade e inatividade dos grupos | Vazio |
| `painel` | Visões consolidadas | Vazio |
| `materiais` | Materiais compartilhados | Vazio |
| `comum` | Infraestrutura sem regra de negócio: erros, banco, validação, situação, OpenAPI | Pronto |

### Regras de fronteira

1. Cada pasta de `src/modulos/` é um módulo. O `index.ts` do módulo é a sua API pública; tudo em `internal/` é privado.
2. De fora de um módulo, só se importa o `index.ts` dele; o módulo `comum` não usa módulos de negócio; não há dependência circular entre módulos. O lint (`eslint-plugin-boundaries`) aponta as violações no editor, e o teste `arquitetura-modular.test.ts` as verifica **em todo build**.
3. Cada módulo é dono dos seus dados: um schema por módulo, todo model com `@@schema` e nenhuma relação com models de outro módulo (o mesmo teste confere o `schema.prisma`).
4. Reações entre módulos acontecem por **eventos** (`@nestjs/event-emitter`), não por chamadas que atravessam os dados de outro módulo.

No front-end vale a mesma ideia: cada pasta de `src/features/` só é usada pelo seu `index.ts`, e o lint bloqueia importações de arquivos internos de outra feature.

### O caminho de uma fatia vertical

```
Cenário Gherkin (Azure Boards)
   ↓
Teste de aceitação     backend/src/modulos/<modulo>/internal/<historia>.aceitacao.test.ts
   ↓
Model e migração       backend/prisma/schema.prisma e prisma/migrations/ (npm run banco:nova-migracao)
   ↓
Controller, serviço e DTOs em src/modulos/<modulo>/internal/, registrados no <modulo>.module.ts
   ↓
Contrato visível em    /swagger-ui
   ↓
Feature no front-end   frontend/src/features/<feature>/ (consultas.ts, componentes, testes)
```

As duas fatias de exemplo seguem exatamente esse caminho. Estude-as antes da primeira Task:

| Fatia | Cenários | Back-end | Front-end |
|---|---|---|---|
| Situação do sistema | `docs/exemplo/situacao-do-sistema.feature` | `modulos/comum/internal/situacao.controller.ts` | `features/situacao/` |
| Sessão do estudante simulado | `docs/exemplo/sessao-simulada.feature` | `modulos/identidade/internal/` | `features/sessao/` |

### Erros da API

Toda resposta de erro segue o formato *Problem Detail* (RFC 9457) e traz a propriedade `codigo`:

```json
{ "status": 422, "title": "Unprocessable Entity", "detail": "O grupo já atingiu o limite de participantes.", "codigo": "GRUPO_LOTADO" }
```

- **Regra de negócio violada:** `throw new ErroDeNegocio(HttpStatus.UNPROCESSABLE_ENTITY, 'GRUPO_LOTADO', '...')`
- **Dados inválidos** (DTO com `class-validator`): 400, `codigo: "DADOS_INVALIDOS"` e o mapa `campos` com a mensagem de cada campo.
- No front-end, `requisitar` converte a resposta em `ErroDaApi`, com `status`, `codigo` e `campos`.

---

## 5. Banco de dados

| Banco | Uso | Quem cria |
|---|---|---|
| `connexa` | Desenvolvimento (`npm run dev`) | variável `POSTGRES_DB` do contêiner |
| `connexa_teste` | Testes automatizados — schemas apagados e recriados pelas migrações a cada execução da suíte | `infra/postgres/init/01-cria-banco-de-teste.sql` |

- Os schemas dos módulos são criados pela primeira migração, `prisma/migrations/00000000000000_schemas_dos_modulos`.
- Tabelas são criadas **somente por migrações** do Prisma Migrate. As convenções estão em `backend/prisma/LEIA-ME.md`.
- O cliente do Prisma é gerado em `src/generated/prisma` pelo `npm install` e pelo `npm run verificar`.
- Conexão: as variáveis `CONNEXA_DB_HOST`, `CONNEXA_DB_PORTA`, `CONNEXA_DB_NOME`, `CONNEXA_DB_USUARIO` e `CONNEXA_DB_SENHA` substituem os padrões.

---

## 6. Estudante simulado

A autenticação real está **fora da Sprint 1**. Enquanto isso, o módulo `identidade` simula o estudante "logado".

- Outros módulos usam apenas a classe `UsuarioAtual`, exportada por `modulos/identidade/index.ts`: `this.usuarioAtual.obter().id`.
- Há três estudantes fictícios em `modulos/identidade/internal/estudantes-simulados.ts`: `alice` (padrão), `bento` e `cecilia`.
- O estudante é escolhido pelo cabeçalho `X-Connexa-Usuario-Simulado: <chave>`:
  - na interface, pelo seletor no topo da página;
  - nos testes, com `.set(CABECALHO_DO_USUARIO_SIMULADO, 'bento')`;
  - em ferramentas como o Swagger ou o `curl`, informando o cabeçalho na requisição.

Quando a autenticação real chegar, só a implementação interna de `identidade` muda; os outros módulos continuam usando `UsuarioAtual`.

---

## 7. Testes e verificação

| Verificação | Onde | Ferramenta |
|---|---|---|
| Testes de aceitação na API (um por cenário Gherkin) | `backend/src/modulos/<modulo>/internal/*.aceitacao.test.ts` | Vitest + Supertest, com `usarTesteDeAceitacao()` |
| Fronteiras entre módulos, dependências circulares e dados de cada módulo | `backend/eslint.config.js` e `backend/src/arquitetura-modular.test.ts` | eslint-plugin-boundaries + Vitest |
| Um schema por módulo | `schemas-dos-modulos.test.ts` | Vitest + `pg` |
| Tipos do back-end | `backend/tsconfig.json` | TypeScript (`npm run tipos`) |
| Lint, tipos e fronteiras entre features | `frontend/eslint.config.js`, `tsconfig.app.json` | ESLint + TypeScript |
| Testes de componente | `frontend/src/**/*.test.tsx` | Vitest + Testing Library |
| Instruções do agente sincronizadas | `AGENTS.md` = `.github/copilot-instructions.md` | `cmp` |

**`usarTesteDeAceitacao()`** sobe a aplicação inteira contra o banco `connexa_teste` e esvazia todas as tabelas antes de cada teste, de modo que um teste nunca vê os dados de outro.

**Convenção de nomes:** um arquivo por história, `describe('Funcionalidade: <nome>')` e um `it('Cenário: <nome exato do cenário>')` por cenário — no back-end e no front-end.

> **Nunca desative uma verificação** para o build passar. Teste ignorado, asserção removida, `@ts-ignore` ou regra de lint desligada transformam a evidência em mentira e invalidam o trabalho da Task.

---

## 8. Agente de IA e Azure Boards

O agente lê as Tasks do Azure Boards por MCP. As instruções que ele segue estão em `AGENTS.md` (Codex) e `.github/copilot-instructions.md` (Copilot) — mantenha os dois idênticos; o CI confere.

| Caminho | Agente | Servidor MCP | Arquivo |
|---|---|---|---|
| 1 | GitHub Copilot no VS Code | Remoto, com login da conta institucional | `.vscode/mcp.json` — conexões `ado-planejamento` (escrita) e `ado-leitura` (somente leitura) |
| 2 | Codex no VS Code | Local, via `npx` (requer Node.js 20+) | `.codex/config.toml` |

Os detalhes de cada caminho, os prompts de referência e o protocolo de falha estão no roteiro da Atividade de Sprint.

---

## 9. Configuração depois de criar o repositório da equipe

A Parte 1 do roteiro da Atividade de Sprint (Etapas 3 e 4) detalha estes passos. Os nomes entre `< >` são escolhidos pela equipe; só o projeto do Azure DevOps tem nome fixo: `Connexa`.

1. **Nome da organização do Azure DevOps:** substitua `<organizacao-azure-devops>` em `.vscode/mcp.json` e `.codex/config.toml`. A organização deve ter sido criada com a conta institucional (Microsoft Entra ID).
2. **Proteção do `main`** (**Settings › Rules › Rulesets** ou **Settings › Branches**):
   - exigir pull request antes do merge, com **1 aprovação**;
   - exigir os checks **Back-end (testes e fronteiras)**, **Front-end (lint, testes e build)** e **Instruções do agente sincronizadas** — eles aparecem na lista depois da primeira execução do CI;
   - bloquear *force push* e exclusão do branch.
3. **Azure Boards ↔ GitHub:** conecte o projeto `Connexa` a `<repositorio-da-equipe>`, em `<organizacao-github>` (**Project Settings › Boards › GitHub connections**), para que `AB#<id>` em commits e pull requests crie o vínculo com o work item.
4. **ADR-001:** registre em `docs/adr/` a arquitetura e a stack adotadas, usando `docs/adr/modelo-adr.md`.

---

## 10. Decisões deste modelo

| Decisão | Motivo |
|---|---|
| Testes usam o PostgreSQL do Compose, em um banco separado (`connexa_teste`) recriado a cada execução | Funciona igual no Codespaces, no CI e na máquina local sem exigir Docker dentro do Codespace. A proposta de arquitetura sugere Testcontainers; a equipe pode adotá-lo em um ADR |
| Isolamento entre testes esvaziando as tabelas antes de cada teste | O Prisma usa a própria conexão; uma transação desfeita ao final não alcançaria as requisições |
| `network_mode: service:db` no Codespaces | O banco responde em `localhost:5432` dentro e fora do Codespaces, e nenhuma configuração muda entre os ambientes |
| Projeto ESM (`"type": "module"`), com imports relativos terminados em `.js` | O NestJS 12 é distribuído como ESM; o mesmo código roda no `nest build`, no Vitest e no Node |
| Testes compilados com SWC (`unplugin-swc`) | O NestJS precisa dos metadados dos decorators, que o compilador padrão do Vitest não gera |
| Fronteiras no lint **e** em um teste | O lint aponta o erro no editor; o teste garante a regra no build e verifica o que o lint não alcança (ciclos e dados do Prisma) |
| Um único `schema.prisma`, com `@@schema` por módulo | O Prisma gera um só cliente; o teste de arquitetura impede relações entre módulos |
| Estudante simulado guardado por requisição com `AsyncLocalStorage` | `UsuarioAtual` funciona em qualquer provider, sem tornar a aplicação dependente do escopo de requisição do Nest |
| Sem `argon2` e sem guards na Sprint 1 | A autenticação está fora da sprint |
| Dependências da sprint já incluídas (Prisma, class-validator, event-emitter, React Hook Form, Zod) | As Tasks proíbem o agente de incluir dependências; o que a equipe precisa já está disponível |
| Sem testes de ponta a ponta no navegador (Playwright) | Fora do escopo da Sprint 1; o roteiro da Atividade de Sprint exige verificação manual dos cenários na interface |
| Versões fixas nos `package.json` | O build é reprodutível; atualizar é uma decisão registrada em ADR |

---

## 11. Solução de problemas

| Sintoma | O que fazer |
|---|---|
| Testes do back-end falham com `ECONNREFUSED` ou `Can't reach database server` | O PostgreSQL não está rodando. Fora do Codespaces: `docker compose up -d db` |
| `database "connexa_teste" does not exist` | O volume foi criado antes do script de inicialização. Rode `docker compose down -v` e `docker compose up -d db` (apaga os dados de desenvolvimento) |
| `Cannot find module '../../generated/prisma/client.js'` | O cliente do Prisma não foi gerado. Em `backend/`, rode `npx prisma generate` (ou `npm install`) |
| `arquitetura-modular.test.ts` ou o lint acusam fronteira | Um arquivo importou o `internal/` de outro módulo, o `comum` usou um módulo de negócio, surgiu um ciclo ou um model ficou sem `@@schema`. A mensagem indica os arquivos. Refaça a mudança respeitando a fronteira — nunca altere o teste nem o lint |
| `Nest can't resolve dependencies` | O provider não está em `providers` do módulo, ou o serviço de outro módulo não está em `exports` dele e em `imports` do seu |
| O lint do front-end acusa importação restrita | Importe a feature pelo `index.ts` (`@/features/<feature>`) e use o alias `@/` |
| A interface mostra "O back-end não está respondendo" | Suba a API em outro terminal: `cd backend && npm run dev` |
| Porta 5432 ocupada na máquina local | Outro PostgreSQL está instalado. Pare-o ou troque a porta publicada no `docker-compose.yml` e use `CONNEXA_DB_PORTA` |

---

*Modelo de repositório — Disciplina de Engenharia de Software — Projeto Connexa.*
