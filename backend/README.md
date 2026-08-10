# Várzea League — Backend

API REST do sistema de campeonatos de futebol amador (várzea). Organizadores
autenticados cadastram times, jogadores, campeonatos e resultados; o público em
geral acompanha classificação, jogos e artilharia sem precisar de login.

## Stack

- **Fastify** + TypeScript
- **Zod** + `fastify-type-provider-zod` para validação de request/response e
  geração automática de tipos
- **Prisma** + **PostgreSQL**
- **@fastify/jwt** para autenticação (email + senha com hash `bcryptjs`)
- **@fastify/swagger** + **@fastify/swagger-ui** para documentação em `/docs`
- **Vitest** para testes unitários e de integração (`app.inject()`)
- **Pino** (nativo do Fastify) para logging estruturado

## Setup local

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

Preencha:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do Postgres, usada em runtime (ex.: Neon ou Supabase, free tier) |
| `DIRECT_URL` | Conexão direta (sem pooler), usada só pelo Prisma Migrate |
| `JWT_SECRET` | Qualquer string forte, usada para assinar os tokens |
| `PORT` | Porta do servidor (padrão `3333`) |

Se o banco for provisionado via **Neon pela integração da Vercel** (Storage →
Marketplace → Neon), a Vercel expõe várias variáveis prontas — use
`POSTGRES_PRISMA_URL` como `DATABASE_URL` (já vem com `pgbouncer=true`, ideal
para runtime) e `POSTGRES_URL_NON_POOLING` como `DIRECT_URL` (conexão direta,
necessária para o Prisma Migrate rodar sem o pooler no meio do caminho).

A validação de env é feita com Zod em `src/config/env.ts` — o servidor falha
rápido, com mensagem clara, se faltar alguma variável obrigatória.

### 2. Instalar dependências

```bash
npm install
```

### 3. Rodar as migrations

```bash
npm run prisma:migrate
```

### 4. (Opcional) Popular o banco com dados de exemplo

```bash
npm run seed
```

Cria um usuário organizador (`organizador@varzealeague.com` / `senha123`),
três times, um campeonato com os três times inscritos e duas partidas (uma
encerrada, uma agendada).

### 5. Subir o servidor

```bash
npm run dev
```

- API: `http://localhost:3333`
- Documentação Swagger: `http://localhost:3333/docs`

## Testes

```bash
npm test
```

Os testes de integração (`tests/integration`) usam `app.inject()` contra um
banco real, apontado por `DATABASE_URL` — cada teste limpa as tabelas antes de
rodar (`tests/integration/helpers.ts`). Recomenda-se usar um banco de
desenvolvimento/teste separado do de produção. Os testes unitários
(`tests/unit`) cobrem `classificacao.service.ts` de forma isolada, sem banco.

## Deploy (Vercel)

O backend roda na Vercel como **função serverless**, não como servidor
persistente: `api/index.ts` reaproveita a mesma instância do Fastify (e do
Prisma Client) entre invocações "quentes" e delega cada request pra dentro
dela via `app.server.emit("request", req, res)`. O `vercel.json` reescreve
todas as rotas (`/`, `/times`, `/campeonatos/:id`, `/docs`, etc.) para essa
função, então o roteamento em si continua sendo feito pelo Fastify
normalmente — só a forma como a requisição chega até ele que muda.

Passos:

1. [vercel.com](https://vercel.com) → **Add New → Project** → importar o
   repositório `VarzeaLeague`.
2. Em **Root Directory**, selecionar `backend` (é monorepo — sem isso a
   Vercel não acha o projeto).
3. Em **Environment Variables**, adicionar `DATABASE_URL`, `DIRECT_URL` e
   `JWT_SECRET` (os mesmos valores do `.env` local).
4. Deploy. O script `vercel-build` (`prisma generate && prisma migrate
   deploy`) roda automaticamente antes do build da função, aplicando
   qualquer migration pendente.
5. A URL pública gerada (`https://<projeto>.vercel.app`) é o que entra como
   `NUXT_PUBLIC_API_BASE` no projeto do frontend na Vercel.

Trade-off consciente: como é serverless, cada container novo ("cold start")
recria a instância do Fastify e reconecta o Prisma — por isso o uso do Neon
(desenhado pra conexões serverless, com pooler via `pgbouncer`) em vez de um
Postgres tradicional. O `npm start` local (`prisma migrate deploy && node
dist/server.js`) continua funcionando como servidor persistente comum, caso o
projeto precise rodar em Railway/Render/VPS no futuro.

## Autenticação

Simplificada para fins de portfólio: cadastro por email + senha, sem
confirmação de email. `POST /auth/registro` e `POST /auth/login` retornam um
JWT que deve ser enviado como `Authorization: Bearer <token>` nas rotas de
organizador (todas as `POST`/`PATCH`). Qualquer usuário autenticado pode
gerenciar qualquer recurso — não há conceito de "dono" por time/campeonato
no MVP.

## Arquitetura de pastas

```
api/
  index.ts             entrypoint da função serverless (deploy na Vercel)
src/
  modules/
    auth/            registro e login
    times/            CRUD de times e adição de jogadores ao elenco
    jogadores/        consulta de jogador
    campeonatos/       CRUD de campeonatos
    participacoes/    inscrição de times em campeonatos
    partidas/          agendamento e lançamento de resultado
    classificacao/    cálculo de classificação e artilharia
  plugins/            prisma, jwt, error-handler, swagger (plugins do Fastify)
  shared/errors/       classes de erro customizadas
  config/env.ts        validação de variáveis de ambiente
  app.ts / server.ts
prisma/
  schema.prisma
  seed.ts
tests/
  unit/                testes puros, sem banco
  integration/         testes via app.inject(), contra banco real
```

Cada módulo segue **routes → controller → service → repository → schema**:
- **routes**: registra as rotas, aplica schemas Zod e `onRequest: [authenticate]`
  nas rotas de organizador.
- **controller**: só lida com request/response HTTP.
- **service**: regra de negócio, lança os erros customizados (`NotFoundError`,
  `ConflictError`, `ValidationAppError`, `UnauthorizedError`).
- **repository**: única camada que fala com o Prisma.

## Decisões técnicas

**Por que a classificação é calculada, e não armazenada?**
A tabela de classificação não existe como entidade no banco — é derivada em
tempo real a partir da tabela `Partida` toda vez que `GET
/campeonatos/:id/classificacao` é chamada (`classificacao.service.ts`). Isso
elimina qualquer risco de a tabela ficar dessincronizada do resultado real das
partidas (o problema clássico de dado duplicado/derivado ficando desatualizado
depois de uma correção de placar). O custo é recalcular a cada request, o que
é irrelevante na escala de um campeonato amador.

**Critério de desempate por confronto direto**
Depois de pontos, saldo de gols e gols pró, o desempate final olha só para os
jogos entre os dois times empatados (`pontosNoConfrontoDireto` em
`classificacao.service.ts`). Esse critério, por natureza, é definido par-a-par
— não existe uma extensão trivial e sempre consistente dele para grupos de 3+
times empatados (é o mesmo problema que aparece nos critérios oficiais de
competições reais, que em geral limitam o confronto direto a exatamente dois
times empatados). A implementação aqui usa o comparator do `Array.sort`, que é
suficiente e didático para o escopo do MVP, mas é o ponto do projeto que mais
vale a pena discutir a fundo (é onde a regra de negócio deixa de ser trivial).

**`classificacao.service.ts` é uma função pura**
Recebe times e partidas já buscados pelo repository e devolve a tabela
ordenada, sem tocar em Prisma/Fastify — por isso é testável com Vitest sem
subir banco nenhum (`tests/unit/classificacao.service.test.ts`).

**Camadas por módulo (routes/controller/service/repository)**
Facilita trocar a única camada que conhece o Prisma (repository) sem tocar em
regra de negócio, e mantém o controller livre de lógica — só tradução
HTTP ↔ chamada de serviço.

**`bcryptjs` em vez de `bcrypt`**
`bcrypt` depende de compilação nativa (node-gyp), o que costuma ser um ponto
de atrito em ambiente Windows sem as build tools instaladas. `bcryptjs` é uma
implementação pura em JS, mais lenta em cargas muito altas mas totalmente
suficiente para o volume de um sistema de várzea.
