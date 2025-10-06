# Neo Commerce

Neo Commerce is a neo‑futuristic e‑commerce experience that pairs a premium storefront with an AI assistant, recovery automations, saved checkout preferences, and an admin suite. The codebase is a pnpm workspace so the web app, AI service, and shared UI live in one place.

## Repo layout

| Path | Description |
| --- | --- |
| `apps/web` | Next.js 14 storefront + admin (TypeScript, Tailwind, Prisma, NextAuth) |
| `apps/ai` | FastAPI microservice for embeddings, retrieval, answers |
| `packages/ui` | Shared React components + Aurora theme tokens |

## Tech stack

- Next.js 14 / React 18 / App Router
- Tailwind CSS Aurora gradient theme
- Prisma ORM + PostgreSQL (addresses, payment methods, orders, feature flags, etc.)
- NextAuth (credentials provider demo)
- FastAPI + sentence-transformers for the assistant
- pnpm workspace tooling

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env file
cp apps/web/.env.example apps/web/.env

# 3. Apply Prisma schema & seed demo data
pnpm --filter web prisma migrate deploy
pnpm --filter web prisma db seed

# 4. Run the web app (http://localhost:3000)
pnpm --filter web dev

# 5. (Optional) run the AI service (http://localhost:8000)
cd apps/ai
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
TRANSFORMERS_NO_TF=1 uvicorn neo_ai.main:app --app-dir apps/ai/neo_ai --reload --port 8000
```

Demo credentials:

- Admin: `admin@demo.dev` / `password123`
- Shopper: `user@demo.dev` / `password123`

## Environment variables (web)

Copy `.env.example`, then update the fields you need:

```
NEXTAUTH_SECRET=generate_me
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/postgres
EMAIL_SERVER=
EMAIL_FROM=no-reply@neo-commerce.dev
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
AI_SERVICE_URL=http://localhost:8000
FEATURE_SENTIMENT=true
FEATURE_TICKETING=true
FEATURE_RERANKER=false
```

If you deploy the AI service separately, point `AI_SERVICE_URL` to that host. Prisma expects Postgres; swap the connection string for your managed instance in production.

## Features

### Storefront
- Aurora-themed glass UI with curated gradient product imagery
- Saved address & payment drawers; checkout preloads defaults automatically
- AI assistant widget with FAQ, product, cart-recovery, and returns modes

### Admin
- Gradient topbar + quick links
- Dashboard with revenue, login heatmap, inventory health, cart recovery stats
- CRUD for products, knowledge base, feature flags, tickets; bulk restock actions

### FastAPI service
- Hybrid TF-IDF + MiniLM embeddings for retrieval
- `/embed`, `/answer`, `/health` endpoints
- Metadata hooks ready for sentiment + ticket automations

## Deployment notes

### GitHub + Netlify (storefront)

1. Push to GitHub (repo example: `https://github.com/taran050701/neo-commerce`).
2. In Netlify choose **Import from GitHub**.
3. Build settings:
   - **Base directory**: `apps/web`
   - **Build command**: `pnpm --filter web build`
   - **Publish directory**: `apps/web/.next`
4. Mirror your environment variables in Netlify.
5. Run `pnpm --filter web prisma migrate deploy` against your hosted Postgres whenever schema changes.

### Alternate deployment

- Vercel handles the Next.js app with the same build command.
- Fly.io / Render / Railway can host the FastAPI service (`uvicorn neo_ai.main:app`).
- Neon, Supabase, or RDS are good Postgres options.

## Useful scripts

| Command | Description |
| --- | --- |
| `pnpm --filter web dev` | Next.js dev server |
| `pnpm --filter web build` | Production build |
| `pnpm --filter web lint` | Next.js lint |
| `pnpm --filter web prisma migrate deploy` | Apply Prisma migrations |
| `pnpm --filter web prisma db seed` | Seed demo data |
| `pnpm --filter web test` | Placeholder for Vitest |
| `pnpm --filter web e2e` | Placeholder for Playwright |

## Customization

- Aurora theme colors live in `apps/web/tailwind.config.ts` and `apps/web/src/styles/globals.css`.
- Saved checkout data uses Prisma models `UserAddress` and `PaymentMethod`.
- The assistant UI lives in `apps/web/src/components/assistant/assistant-panel.tsx` and proxies `/api/assistant/query`.

## Contributing

PRs welcome! Please open an issue before large changes so we can coordinate direction.

## License

MIT (update if you need a different license).
