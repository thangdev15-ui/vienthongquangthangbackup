-- ============================================================================
-- Viễn Thông Quang Thắng — Supabase schema + Row Level Security
-- Mirrors src/db/schema.ts (Drizzle). Apply with: psql / SQL editor.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ------------------------------ profiles -----------------------------------
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  password_hash text not null,
  role text not null default 'customer' check (role in ('customer','admin','staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  label text, name text not null, phone text not null,
  address text not null, province text, district text, ward text
);

create table if not exists password_resets (
  id uuid primary key default gen_random_uuid(),
  email text not null, token text not null,
  expires_at timestamptz not null, used boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------ catalog ------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique, description text, image text,
  parent_id uuid, sort_order int not null default 0, active boolean not null default true,
  seo_title text, seo_description text, created_at timestamptz not null default now()
);
create index if not exists categories_slug_idx on categories(slug);

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique, logo text, description text, website text,
  active boolean not null default true, seo_title text, seo_description text,
  created_at timestamptz not null default now()
);
create index if not exists brands_slug_idx on brands(slug);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique, sku text,
  short_description text, description text,
  price int, sale_price int, price_type text not null default 'contact',
  stock int not null default 0,
  brand_id uuid references brands(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published')),
  featured boolean not null default false, bestseller boolean not null default false,
  sale boolean not null default false, rating real not null default 0,
  review_count int not null default 0, warranty text,
  seo_title text, seo_description text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists products_slug_idx on products(slug);
create index if not exists products_sku_idx on products(sku);
create index if not exists products_category_idx on products(category_id);
create index if not exists products_brand_idx on products(brand_id);
create index if not exists products_status_idx on products(status);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null, sort_order int not null default 0, is_main boolean not null default false
);

create table if not exists product_categories (
  product_id uuid not null references products(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table if not exists product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null, value text not null, sort_order int not null default 0
);

-- ------------------------------ orders -------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  profile_id uuid references profiles(id) on delete set null,
  customer_name text not null, phone text not null, email text,
  address text not null, province text, district text, ward text, note text,
  payment_method text not null default 'cod',
  status text not null default 'pending'
    check (status in ('pending','confirmed','processing','shipping','completed','cancelled')),
  subtotal int not null default 0, shipping_fee int not null default 0,
  discount int not null default 0, total int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_idx on orders(created_at);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null, sku text, product_image text,
  unit_price int not null, quantity int not null, subtotal int not null
);

-- ------------------------------ content ------------------------------------
create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, product_id)
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  customer_name text not null, rating int not null check (rating between 1 and 5),
  content text not null, status text not null default 'pending'
    check (status in ('pending','approved','hidden','featured')),
  created_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on reviews(product_id);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique, excerpt text, content text not null,
  cover_image text, category text, tags text, status text not null default 'published',
  seo_title text, seo_description text,
  published_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create index if not exists articles_slug_idx on articles(slug);
create index if not exists articles_status_idx on articles(status);

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  title text not null, subtitle text, image text, mobile_image text,
  button_text text, button_url text, active boolean not null default true,
  sort_order int not null default 0, start_date date, end_date date
);

create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, badge text, image text, url text,
  active boolean not null default true, sort_order int not null default 0,
  start_date date, end_date date
);

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, title text not null, content text not null,
  seo_title text, seo_description text, updated_at timestamptz not null default now()
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique, created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, phone text, email text, message text not null,
  created_at timestamptz not null default now()
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null, filename text, mime_type text,
  size bigint, created_at timestamptz not null default now()
);

create table if not exists admin_settings (
  key text primary key, value text, updated_at timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Helper: is this user an admin? (profiles.role)
-- ============================================================================
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin','staff')
  );
$$;

alter table products enable row level security;
alter table categories enable row level security;
alter table brands enable row level security;
alter table product_images enable row level security;
alter table product_categories enable row level security;
alter table product_specifications enable row level security;
alter table articles enable row level security;
alter table banners enable row level security;
alter table promotions enable row level security;
alter table pages enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table wishlists enable row level security;
alter table addresses enable row level security;
alter table profiles enable row level security;
alter table admin_settings enable row level security;
alter table media_assets enable row level security;
alter table newsletter_subscribers enable row level security;
alter table contact_messages enable row level security;

-- Public read (published content only)
create policy "products public read" on products for select using (status = 'published');
create policy "categories public read" on categories for select using (true);
create policy "brands public read" on brands for select using (active);
create policy "product_images public read" on product_images for select using (true);
create policy "product_categories public read" on product_categories for select using (true);
create policy "product_specifications public read" on product_specifications for select using (true);
create policy "articles public read" on articles for select using (status = 'published');
create policy "banners public read" on banners for select using (active);
create policy "promotions public read" on promotions for select using (active);
create policy "pages public read" on pages for select using (true);
create policy "reviews public read" on reviews for select using (status in ('approved','featured'));

-- Catalog writes: admin only (all other writes handled via service role)
create policy "products admin write" on products for all using (public.is_admin()) with check (public.is_admin());
create policy "categories admin write" on categories for all using (public.is_admin()) with check (public.is_admin());
create policy "brands admin write" on brands for all using (public.is_admin()) with check (public.is_admin());
create policy "product_images admin write" on product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "product_categories admin write" on product_categories for all using (public.is_admin()) with check (public.is_admin());
create policy "product_specifications admin write" on product_specifications for all using (public.is_admin()) with check (public.is_admin());
create policy "articles admin write" on articles for all using (public.is_admin()) with check (public.is_admin());
create policy "banners admin write" on banners for all using (public.is_admin()) with check (public.is_admin());
create policy "promotions admin write" on promotions for all using (public.is_admin()) with check (public.is_admin());
create policy "pages admin write" on pages for all using (public.is_admin()) with check (public.is_admin());
create policy "admin_settings admin write" on admin_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "media_assets admin write" on media_assets for all using (public.is_admin()) with check (public.is_admin());

-- Orders: NO direct client writes (orders are created server-side via service role).
-- Customers can only read their own orders.
create policy "orders own read" on orders for select using (profile_id = auth.uid() or public.is_admin());
create policy "orders admin write" on orders for all using (public.is_admin()) with check (public.is_admin());
create policy "order_items own read" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.profile_id = auth.uid() or public.is_admin()))
);
create policy "order_items admin write" on order_items for all using (public.is_admin()) with check (public.is_admin());

-- Reviews: signed-in users may submit (always pending); admin moderates.
create policy "reviews authenticated insert" on reviews for insert with check (auth.uid() is not null);
create policy "reviews admin write" on reviews for all using (public.is_admin()) with check (public.is_admin());

-- Wishlist / addresses / profile: owner-only
create policy "wishlists owner all" on wishlists for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "addresses owner all" on addresses for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "profiles self read" on profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on profiles for update using (id = auth.uid());
create policy "profiles admin write" on profiles for all using (public.is_admin()) with check (public.is_admin());

-- Newsletter: anyone may subscribe; reads admin only.
create policy "newsletter subscribe" on newsletter_subscribers for insert with check (true);
create policy "newsletter admin read" on newsletter_subscribers for select using (public.is_admin());

-- Contact messages: public insert, admin read.
create policy "contact public insert" on contact_messages for insert with check (true);
create policy "contact admin read" on contact_messages for select using (public.is_admin());
