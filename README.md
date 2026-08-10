# Várzea League

Sistema de campeonatos de futebol amador (várzea): organizadores cadastram
times, jogadores, campeonatos e resultados; o público acompanha classificação,
jogos e artilharia sem precisar de login.

Projeto de portfólio com foco em qualidade de arquitetura backend, modelagem
relacional e uma regra de negócio não trivial (cálculo de classificação com
critério de desempate por confronto direto). A especificação completa do MVP
está em [`campeonatos-varzea-mvp.md`](./campeonatos-varzea-mvp.md).

## Estrutura

```
backend/     API REST (Fastify + Prisma + PostgreSQL) — ver backend/README.md
frontend/    Nuxt 3 + Tailwind, consumindo a API — scaffold mínimo por enquanto
```

Cada pasta tem seu próprio `package.json` e é deployável de forma independente
(backend no Railway/Render, frontend na Vercel).

## Começando

Veja [`backend/README.md`](./backend/README.md) para setup completo da API
(variáveis de ambiente, migrations, seed, testes, decisões técnicas).

Para o frontend:

```bash
cd frontend
npm install
npm run dev
```
