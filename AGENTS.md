# Agentic Onboarding: Saleor Portal

> **Goal**: A vendor/supplier portal for interacting with the Saleor ecosystem.

## 1. Project Identity

- **Stack**:
  - **Framework**: Next.js 16 (App Router)
  - **Language**: TypeScript
  - **Auth**: NextAuth v5
  - **Database**: Vercel Postgres
  - **ORM**: Drizzle ORM
  - **Styling**: Tailwind CSS, Lucide React
- **Deployment**: Vercel (assumed based on stack)

## 2. Agent Protocol

> **Methodology**: Follow this cycle for every task.

1. **Explore**: Read `AGENTS.md` to understand Auth and Database rules.
2. **Verify**: Run `pnpm lint` to ensure no restricted imports are used.

## 3. Critical Rules

- **Package Manager**: Check `package.json` (likely `pnpm` or `npm`; repo uses `pnpm-lock.yaml` so **use pnpm**).
- **Database**: Use Drizzle ORM for all database interactions.
- **Auth**: Use NextAuth v5 patterns (server-side auth).
- **Automated Guardrails**:
  - **Trigger.dev**: Lint rules BLOCK importing `@trigger.dev/sdk/v3`. Use v4.
- **Documentation Maintenance**: If you add new major tech, change the build process, or discover a repeated "gotcha", YOU MUST update this file (`AGENTS.md`) to reflect the new state. Keep it living.

## 6. Ecosystem Links

- **Backend Apps**: `c:/Users/jopbr/Documents/GitHub/apps/AGENTS.md` (Source of backend logic/webhooks).
- **Storefront**: `c:/Users/jopbr/Documents/GitHub/storefront/AGENTS.md` (Reference for shared UI patterns).

## 3. Map of the Territory

- `src/app`: App Router pages.
- `drizzle/`: Database migrations.
- `public/`: Static assets.

## 4. Golden Paths

### Development

```bash
pnpm dev
```

### Database

```bash
# Push schema changes
pnpm drizzle-kit push
```
