# AeroCrew Admin

Operations control centre for AeroCrew airport crew transportation. The portal supports crew and operator oversight, active transport requirements, dispatch foundations, pricing zones, reconciliation, reporting, and internal configuration.

## Stack

- Next.js 16 App Router and React 19
- TypeScript in strict mode
- Tailwind CSS 4 with semantic Skyline Blue CSS tokens
- Supabase browser client for the existing `users` and `active_pools` integrations
- `next-themes` for persistent System, Light, and Dark appearance modes

## Local setup

Use Node.js 20 or newer and npm (the repository is locked with `package-lock.json`).

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

Required local variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ADMIN_PASSWORD=
```

The current password gate is a temporary client-side control and is not suitable as the final production authentication boundary. Before launch, replace it with server-validated identity, protected sessions/middleware, role checks, and verified Supabase row-level security.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

There is currently no automated test script.

## Data status

The Overview keeps the existing Supabase-backed user and active-pool queries. Live Operations uses typed scenario fixtures in `lib/fixtures/live-operations.ts` until live trips, telemetry, contact, assignment, and incident services are connected. Other legacy fixture-backed pages should not be treated as production operational data.
