# VerifiedMeasure — Unified Shell + 16 Vertical Dashboards

This is a Next.js (App Router) dashboard that renders one unified control-plane shell with 16 fully differentiated vertical intelligence products inside the same shell.

## Runtime Requirements
- Node.js 18+ (recommended 20+)
- Vercel deploy (or local `next dev`)

## Environment Variables (Vercel / Local)
Set ONLY the following (no service role key):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Do **NOT** commit `.env` files.

## Local Dev
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run start
```

## App Routes
- `/dashboard` redirects to `/dashboard/dealflow`
- `/dashboard/[verticalKey]` renders unified shell + vertical module

## Supabase Data Model Assumptions (Existing / Locked)
- Preview access: authenticated users can SELECT from each vertical table (no row hiding for preview)
- Entitlements: stored in per-vertical `*_access` tables, scoped by `user_id = auth.uid()`
- Unlocking: done ONLY via existing `unlock_*_secure` RPC functions
- Credits: append-only `credit_ledger` with `delta` integer; balance computed by `sum(delta)` per user

## Security Notes
- Uses Supabase anon key only
- No service role key in runtime
- No direct client mutations except via RPC calls

## Vertical Keys
- dealflow
- salesintel
- supplyintel
- clinicalintel
- legalintel
- marketresearch
- academicintel
- creatorintel
- gamingintel
- realestateintel
- privatecreditintel
- cyberintel
- biopharmintel
- industrialintel
- govintel
- insuranceintel

## Troubleshooting
- Ensure the user is authenticated in Supabase Auth (email/password or magic link)
- Ensure the database already contains the required tables and RPCs (see `SUPABASE_VALIDATE.sql`)
- If credit balance shows 0, ensure `credit_ledger` has rows for the user (append-only)
