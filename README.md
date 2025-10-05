# Neo Commerce

A neo-futuristic e-commerce platform that extends the AI-powered support + cart-recovery MVP into a production-ready monorepo.

## Overview
- **apps/web** – Next.js 14 + TypeScript storefront, admin dashboards, API routes.
- **apps/ai** – FastAPI microservice for embeddings, retrieval, and grounded answers.
- **packages/ui** – Shared React components with glassmorphism styling.

## Quick Start
```bash
# Install dependencies
pnpm install

# Setup environment
cp apps/web/.env.example apps/web/.env

# Database
pnpm --filter web prisma migrate deploy
pnpm --filter web prisma db seed

# Run services
pnpm --filter web dev        # http://localhost:3000
TRANSFORMERS_NO_TF=1 uvicorn neo_ai.main:app --app-dir apps/ai/neo_ai --reload --port 8000
```

## Environment Variables (`apps/web/.env.example`)
```
NEXTAUTH_SECRET=generate_me
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:6543/postgres
DIRECT_URL=postgresql://postgres:postgres@localhost:6543/postgres
EMAIL_SERVER=
EMAIL_FROM=no-reply@neo-commerce.dev
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
AI_SERVICE_URL=http://localhost:8000
FEATURE_SENTIMENT=true
FEATURE_TICKETING=true
FEATURE_RERANKER=false
```

## Scripts
- `pnpm dev` – Run app + watch modes via workspaces.
- `pnpm db:migrate` – Deploy Prisma migrations.
- `pnpm db:seed` – Load demo data (admin/user accounts, sample products).
- `pnpm test` – Run Vitest suites (placeholder).
- `pnpm e2e` – Run Playwright tests (placeholder).

## Assistant panel
- Floating UI with FAQ/Product/Cart/Returns modes
- Displays overview, matches, context JSON, and follow-up actions
- Calls `/api/assistant/query` which proxies the FastAPI microservice

## Admin workspace
- Dashboard metrics (revenue, tickets, cart recovery)
- Products, Knowledge Base, Tickets, Feature Flags, Analytics sections with Prisma-backed forms

## Cart Recovery Cron (Vercel)
```
0 */2 * * *  curl -X POST "$APP_URL/api/recover" \
  -H "Authorization: Bearer $CRON_SECRET"
```
The handler issues signed recovery links using `createRecoveryToken`, sends via Resend, and logs outcomes to `SearchEvent` + `FeatureFlag` audit tables.

## Testing
- **Unit**: Vitest with module mocking for Prisma + AI client.
- **E2E**: Playwright running headless flows for sign-in, checkout, assistant replies.
- **Python**: Pytest hitting `/health`, `/embed`, `/answer` for smoke coverage.

## TODO Highlights
- Implement real semantic search with pgvector in `/api/search`.
- Build assistant UI floating panel and websocket streaming.
- Flesh out admin dashboards and CSV import/export flows.
- Add sentiment + ticket automation across web + AI service.
- Harden error boundaries, rate limiting, audit trail log sink.
