# Anesthesia Care API

Backend serverless para Vercel com Neon Postgres, autenticação JWT e endpoints REST para pacientes, produtos e medicamentos.

## Stack

- Vercel Functions em TypeScript
- Neon Postgres
- Drizzle ORM
- JWT + bcrypt
- Zod para validação

## Configuração local

```bash
cd anesthesia-care-api
npm install
cp .env.example .env.local
```

Preencha:

```env
DATABASE_URL="postgres://..."
JWT_SECRET="uma-chave-bem-longa"
CORS_ORIGIN="*"
```

Essas variáveis ficam somente na Vercel e no seu `.env.local`. Nunca coloque credenciais do Neon em arquivos versionados ou no código.

Crie as tabelas no Neon com uma destas opções:

```bash
npm run db:push
```

ou cole o conteúdo de `db/schema.sql` no SQL Editor do Neon.

Depois rode:

```bash
npm run dev
```

A API local fica em `http://localhost:3000`.

No deploy, a raiz `/` mostra uma página simples de status. O teste real da API é:

```text
/api/health
```

## Deploy na Vercel + Neon

1. Crie/importe o projeto na Vercel apontando para `anesthesia-care-api`.
2. Adicione Neon pelo Vercel Marketplace ou conecte um banco Neon existente.
3. Configure as variáveis `DATABASE_URL`, `JWT_SECRET` e `CORS_ORIGIN`.
4. Rode `npm run db:push` localmente com `DATABASE_URL` apontando para o banco de produção, ou aplique `db/schema.sql` no painel da Neon.
5. Faça o deploy.

## Autenticação

O login retorna um token JWT. Envie esse token nas rotas protegidas:

```http
Authorization: Bearer <token>
```

## Rotas

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/patients`
- `POST /api/patients`
- `GET /api/patients/:id`
- `PATCH /api/patients/:id`
- `DELETE /api/patients/:id`
- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/medications`
- `POST /api/medications`
- `GET /api/medications/:id`
- `PATCH /api/medications/:id`
- `DELETE /api/medications/:id`

## Insomnia

Importe `insomnia/anesthesia-care-api.json`.

Use o ambiente `Local` para desenvolvimento. Depois do login, copie o `token` retornado para a variável `token` do ambiente.
