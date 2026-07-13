# AeroCrew Admin

Internal operations control centre for AeroCrew airport crew transportation.

## Stack

- Next.js 16 App Router and React 19
- TypeScript in strict mode
- Supabase Auth with `@supabase/ssr` cookie-backed sessions
- Database-backed admin authorisation through `admin_profiles`
- Tailwind CSS 4 with Skyline Blue semantic tokens
- `next-themes` System, Light, and Dark modes

## Local setup

Use Node.js 20 or newer and npm. Copy `.env.example` to `.env.local`, then supply the public project values from Supabase Project Settings → API:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Install and run:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. There is no public admin registration flow.

## Admin provisioning

1. Apply `supabase/migrations/202607130001_create_admin_profiles.sql` in the target Supabase project.
2. In Supabase Dashboard → Authentication → Users, create or invite the admin user.
3. Copy that user's UUID and insert its authorisation row from the trusted SQL editor:

```sql
insert into public.admin_profiles (user_id, role, status)
values ('USER_UUID', 'operations_admin', 'active');
```

Allowed roles are `super_admin`, `operations_admin`, `dispatcher`, and `support`. All active roles currently have portal access. Set `status = 'disabled'` or remove the row to revoke it. Do not build a client-side provisioning form or allow users to edit this table.

## Authentication and authorisation

The previous client-only shared-password and browser-storage gate was removed because browser-exposed configuration and mutable local state cannot establish identity or authorisation.

The browser and server clients are separated under `lib/supabase`. Supabase Auth stores its session in SSR-managed cookies. `proxy.ts` refreshes and rejects requests to `/dashboard`, while the dashboard server layout independently calls `auth.getUser()` and verifies the user's active `admin_profiles` row. The central check lives in `lib/auth/admin.ts` so role-specific permissions can be added later.

Authentication alone does not grant access. An authenticated user without an active, valid admin profile is sent to `/access-denied` and no dashboard component is rendered.

## Data and RLS requirements

Existing `users` and `active_pools` reads still run from authenticated browser code. Fixture-backed pages are not production data. Before production use, enable RLS on every operational table and add explicit policies that permit only the required active admin roles and operations. Never treat the dashboard layout as a substitute for table-level RLS: direct API calls can bypass page navigation.

The app does not use a Supabase service-role key. If privileged server workflows are added later, keep that key in a server-only variable, never prefix it with `NEXT_PUBLIC_`, never import it into client components, and scope privileged operations narrowly.

## Validation and production

```powershell
npm install
npm run lint
npm run typecheck
npm run build
npm start
```

Run `npm run build` before `npm start`. Configure the same two public variables in the deployment environment and add the production site URL/redirect URLs in Supabase Auth settings.
