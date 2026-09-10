# Migration to Supabase (production)

This codebase is architected so the data layer can move to Supabase with minimal changes.

## What to do when the Supabase project is provisioned

1. **Environment** — set in `.env` (never commit):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only, for admin-privileged writes)
   - `SESSION_SECRET` — strong random string for session HMAC
   - optional: `RESEND_API_KEY` for the notification provider

2. **Schema** — apply `supabase/schema-with-rls.sql` (mirrors `src/db/schema.ts`
   + Row Level Security policies). Tables and columns are 1:1 with the Drizzle schema,
   so the existing Drizzle code keeps working against Supabase Postgres by pointing
   `DATABASE_URL` at the Supabase connection string (Session mode, direct or pooler).

3. **Auth** — the app currently uses secure HMAC-signed httpOnly session cookies
   (`src/lib/auth.ts`) with scrypt-hashed passwords in `profiles`. To switch to
   Supabase Auth:
   - replace `loginAction/registerAction` with `supabase.auth.signInWithPassword` / `signUp`
   - keep `profiles` as the RLS-owned identity table (`profiles.id = auth.users.id`)
   - `requireAdmin()` then checks `profiles.role = 'admin'` via a security definer
     policy or service-role call.

4. **Storage** — replace `app/api/upload/route.ts` with uploads into the Supabase
   buckets `products`, `articles`, `banners`, `brands`, `pages`
   (signed URLs for admin, public read for product/article images). The Media CMS
   already stores plain URLs, so only the upload handler changes.

5. **Email** — implement the Resend provider inside `src/lib/notifications.ts`
   (`providers` array). All business events (order.created, order.status_changed,
   password.reset_requested, newsletter.subscribed, contact.message) already flow
   through `notify()`.

## Security model (see schema-with-rls.sql)

- `products`, `categories`, `brands`, `articles`, `banners`, `promotions`, `pages`: **read public, write never** (admin writes via service role / API).
- `orders`: customers can `select` **own** orders only (`profile_id = auth.uid()`); insert restricted to server; never update/delete from client.
- `reviews`: public read of approved/featured; insert allowed for signed-in (pending); moderation only via admin.
- `wishlists`, `addresses`, `profiles`: owner-only CRUD.
- `admin_settings`, `media_assets`: no anon access at all.
- `SUPABASE_SERVICE_ROLE_KEY` must only be read server-side (route handlers / server actions).

## Legacy URL 301s

`proxy.ts` maps the old WordPress URLs (top-level product/category/article slugs,
`/?s=`, `/cua-hang/`, `/wishlist/`, policy pages) to the new structure. Keep it
deployed behind the same domain when you cut over.
