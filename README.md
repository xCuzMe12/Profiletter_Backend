# Profiletter Backend

API server for **Profiletter Chat** — a Claude-powered CRM assistant with MCP access to **Stranke** and **Leads**.

This repo is the **backend only** (Fly.io). The web UI lives in a separate frontend project.

## Stack

- Node.js 20+ / TypeScript
- Fastify
- PostgreSQL + Prisma (primary DB on Fly; Supabase URL reserved as backup)
- Redis (rate limit / cache / future jobs)
- Anthropic Claude API
- MCP-style CRM tool gateway (Twenty CRM)
- JWT auth + audit logging
- SSE streaming chat (`POST /chat`)

## Terminology

| Internal | User-facing |
|---|---|
| People records | Stranke / Stranka |
| Opportunities | Leads / Lead |
| Assistant | Profiletter Chat |

Do not expose labels like People, Persons, Opportunities in API messages or prompts.

## Quick start (local)

```bash
cp .env.example .env
# edit JWT_SECRET, DATABASE_URL, ANTHROPIC_API_KEY, etc.

docker compose up -d
npm install
npx prisma migrate deploy
npm run dev
```

API: `http://localhost:8080`

### Bootstrap admin

Set in `.env`:

```env
BOOTSTRAP_ADMIN_EMAIL=admin@profiletter.local
BOOTSTRAP_ADMIN_PASSWORD=change-me-strong
```

Then:

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@profiletter.local","password":"change-me-strong"}'
```

## Main endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | no | Liveness |
| GET | `/ready` | no | DB / Redis / config readiness |
| POST | `/auth/login` | no | JWT login |
| GET | `/auth/me` | yes | Current user |
| GET | `/conversations` | yes | List chats |
| POST | `/conversations` | yes | Create chat |
| GET | `/conversations/:id` | yes | Chat + messages |
| DELETE | `/conversations/:id` | yes | Archive chat |
| POST | `/chat` | yes | Send message (SSE stream) |

### Chat SSE events

`meta`, `text_delta`, `tool_call`, `tool_result`, `done`, `error`

## CRM tools (read-only v1)

MCP gateway tools:

- `search_stranke` / `get_stranka`
- `search_leads` / `get_lead`
- `aggregate_crm`

Without `TWENTY_API_URL` + `TWENTY_API_KEY`, demo CRM data is returned so the tool loop can be tested end-to-end.  
`CRM_WRITE_ENABLED=false` by default.

## Database

- **Primary:** `DATABASE_URL` (Fly Postgres recommended)
- **Backup (optional):** `BACKUP_DATABASE_URL` (e.g. Supabase) — currently reported in `/ready`; failover wiring is future work

## Deploy to Fly.io

```bash
fly launch   # or use existing fly.toml
fly secrets set \
  JWT_SECRET=... \
  DATABASE_URL=... \
  REDIS_URL=... \
  ANTHROPIC_API_KEY=... \
  CORS_ORIGIN=https://your-frontend.example
fly deploy
```

`fly.toml` runs `prisma migrate deploy` as the release command and health-checks `/health`.

## Project layout

```text
src/
  ai/           Claude + system prompt
  auth/         JWT + middleware
  config/       env (Zod)
  lib/          prisma, redis, errors
  mcp/          CRM tool gateway
  routes/       HTTP API
  services/     conversations, audit
prisma/         schema + migrations
Dockerfile      Fly image
fly.toml        Fly app config
```

## v1 scope

Prioritize reliable **read-only** Stranke / Leads queries. Write actions, workflows, and dashboards come later.
