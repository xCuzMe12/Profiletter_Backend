# Profiletter

CRM + AI chat product built on **Atomic CRM** (React / Supabase) with a **Profiletter Chat API** (Fastify / Claude).

```text
Browser → Atomic CRM UI (web/) → Supabase (Stranke/Leads)
                │
                └── Profiletter Chat (/chat) → API (src/) → Claude + MCP → Supabase
```

## Terminology

| Atomic table | User-facing label |
|---|---|
| `contacts` | Stranke / Stranka |
| `deals` | Leads / Lead |
| Assistant | Profiletter Chat |

## Structure

```text
Profiletter_Backend/
  src/                 Fastify API — auth, conversations, Claude, MCP
  prisma/              Chat users / conversations DB
  web/                 Atomic CRM frontend (Vite) + Chat page
  Dockerfile           API image for Fly.io
  fly.toml
```

## Prerequisites

- Node 20+ (Node 24 recommended for Atomic)
- Docker (local Supabase)
- Make (for Atomic `make install` / `make start`)

## 1. Chat API

```bash
cp .env.example .env
# set JWT_SECRET, DATABASE_URL, ANTHROPIC_API_KEY
# set SUPABASE_* from `cd web && npx supabase status`

docker compose up -d          # optional local Postgres + Redis
npm install
npx prisma migrate deploy
npm run dev                   # http://localhost:8080
```

Accepts Profiletter JWTs **or** Supabase access tokens (`SUPABASE_JWT_SECRET`).

## 2. Atomic CRM UI

```bash
cd web
make install                  # or npm install + npx supabase start
# ensure .env.development has VITE_PROFILETTER_API_URL=http://localhost:8080
npm run dev                   # http://localhost:5173
```

Or from `web/`:

```bash
make start
```

Sign up as the first user, then open **Chat** in the top nav.

## MCP / CRM tools

Read-only tools against Supabase:

- `search_stranke` / `get_stranka` → `contacts`
- `search_leads` / `get_lead` → `deals`
- `aggregate_crm`

Without `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, demo data is returned.

## Deploy

| Piece | Target |
|---|---|
| API | Fly.io (`fly deploy`) |
| CRM UI | GitHub Pages / static host / your CDN (`cd web && make prod-deploy`) |
| CRM data | Supabase |
| Chat DB | Fly Postgres (or managed Postgres) |

## Notes

- The standalone Next.js app in `../profiletter-chat` is superseded by `web/` Chat.
- Twenty CRM integration was removed in favor of Atomic + Supabase.
