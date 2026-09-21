-- ============================================================
-- PEHNAV — Wear Your Story
-- Complete Supabase Schema
-- Run this in Supabase → SQL Editor
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  phone        text,
  avatar_url   text,
  role         text not null default 'customer' check (role in ('customer', 'admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ADDRESSES
-- ============================================================
create table public.addresses (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  full_name    text not null,
  phone        text not null,
  line1        text not null,
  line2        text,
  city         text not null,
  state        text not null,
  pincode      text not null,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- PRODUCTS (mirrors data.ts, managed from admin)
-- ============================================================
create table public.products (
  id           text primary key, -- slug like 'ember-oversized-tee'
  name_en      text not null,
  name_hi      text not null,
  price        integer not null, -- in paise (₹999 = 99900) — actually store in rupees as integer
  compare_at   integer,
  image_url    text not null,
  gallery      text[] not null default '{}',
  category     text not null,
  product_group text not null,
  gender       text not null check (gender in ('men', 'women', 'unisex')),
  collection   text,
  colors       text[] not null default '{}',
  sizes        text[] not null default '{}',
  rating       numeric(3,1) not null default 4.5,
  review_count integer not null default 0,
  badge        text check (badge in ('new', 'bestseller', 'limited')),
  in_stock     boolean not null default true,
  stock        integer not null default 100,
  story_en     text not null default '',
  story_hi     text not null default '',
  description_en text not null default '',
  description_hi text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Full-text search index
create index products_search_idx on public.products
  using gin((name_en || ' ' || name_hi || ' ' || category || ' ' || coalesce(collection,'')) gin_trgm_ops);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id           text primary key,
  name_en      text not null,
  name_hi      text not null,
  image_url    text not null,
  product_group text not null,
  sort_order   integer not null default 0
);

-- ============================================================
-- COLLECTIONS
-- ============================================================
create table public.collections (
  id           text primary key,
  name_en      text not null,
  name_hi      text not null,
  tagline_en   text not null,
  tagline_hi   text not null,
  description_en text not null,
  description_hi text not null,
  image_url    text not null,
  sort_order   integer not null default 0
);

-- ============================================================
-- WISHLIST
-- ============================================================
create table public.wishlists (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  product_id   text not null references public.products(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique(user_id, product_id)
);

-- ============================================================
-- CART (server-side cart for logged-in users)
-- ============================================================
create table public.cart_items (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  product_id   text not null references public.products(id) on delete cascade,
  size         text not null,
  color        text not null,
  qty          integer not null default 1 check (qty > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique(user_id, product_id, size, color)
);

-- ============================================================
-- COUPONS
-- ============================================================
create table public.coupons (
  id           uuid primary key default uuid_generate_v4(),
  code         text not null unique,
  type         text not null check (type in ('percent', 'fixed')),
  value        numeric(10,2) not null,
  min_spend    numeric(10,2) not null default 0,
  max_uses     integer,
  used_count   integer not null default 0,
  active       boolean not null default true,
  expires_at   timestamptz,
  created_at   timestamptz not null default now()
);

-- Seed default coupon
insert into public.coupons (code, type, value, min_spend, active)
values ('PEHNAV10', 'percent', 10, 0, true);

-- ============================================================
-- ORDERS
-- ============================================================
create table public.orders (
  id               uuid primary key default uuid_generate_v4(),
  order_number     text not null unique, -- PHN-XXXXX
  user_id          uuid references public.profiles(id) on delete set null,
  email            text not null,
  phone            text not null,
  status           text not null default 'pending'
                   check (status in ('pending','processing','packed','shipped','delivered','cancelled','refunded')),

  -- Shipping address snapshot
  shipping_name    text not null,
  shipping_phone   text not null,
  shipping_line1   text not null,
  shipping_line2   text,
  shipping_city    text not null,
  shipping_state   text not null,
  shipping_pincode text not null,

  -- Financials (in rupees)
  subtotal         numeric(10,2) not null,
  discount         numeric(10,2) not null default 0,
  shipping_fee     numeric(10,2) not null default 0,
  total            numeric(10,2) not null,
  coupon_code      text,

  -- Payment
  payment_method   text not null default 'razorpay',
  payment_status   text not null default 'pending'
                   check (payment_status in ('pending','paid','failed','refunded')),
  razorpay_order_id   text,
  razorpay_payment_id text,

  -- Shipping
  tracking_number  text,
  courier          text,
  shipped_at       timestamptz,
  delivered_at     timestamptz,

  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-generate order number
create or replace function public.generate_order_number()
returns trigger language plpgsql as $$
declare
  seq int;
begin
  select count(*) + 10000 into seq from public.orders;
  new.order_number := 'PHN-' || seq::text;
  return new;
end;
$$;

create trigger set_order_number
  before insert on public.orders
  for each row execute function public.generate_order_number();

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table public.order_items (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   text not null,
  product_name text not null,
  image_url    text not null,
  size         text not null,
  color        text not null,
  qty          integer not null,
  unit_price   numeric(10,2) not null,
  total_price  numeric(10,2) not null,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================
create table public.order_status_history (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  status       text not null,
  note         text,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id           uuid primary key default uuid_generate_v4(),
  product_id   text not null references public.products(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete set null,
  order_id     uuid references public.orders(id) on delete set null,
  author_name  text not null,
  rating       integer not null check (rating between 1 and 5),
  title        text,
  body         text not null,
  images       text[] default '{}',
  verified     boolean not null default false, -- verified purchase
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at   timestamptz not null default now()
);

-- Update product rating when review approved
create or replace function public.update_product_rating()
returns trigger language plpgsql as $$
begin
  update public.products
  set
    rating = (
      select round(avg(rating)::numeric, 1)
      from public.reviews
      where product_id = coalesce(new.product_id, old.product_id)
      and status = 'approved'
    ),
    review_count = (
      select count(*)
      from public.reviews
      where product_id = coalesce(new.product_id, old.product_id)
      and status = 'approved'
    )
  where id = coalesce(new.product_id, old.product_id);
  return new;
end;
$$;

create trigger refresh_product_rating
  after insert or update or delete on public.reviews
  for each row execute function public.update_product_rating();

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
create table public.newsletter_subscribers (
  id           uuid primary key default uuid_generate_v4(),
  email        text not null unique,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
create table public.blog_posts (
  id           text primary key,
  title_en     text not null,
  title_hi     text not null,
  category     text not null,
  excerpt_en   text not null,
  excerpt_hi   text not null,
  body_en      text not null default '',
  body_hi      text not null default '',
  image_url    text not null,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- UPDATED_AT TRIGGER (shared)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.cart_items
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Helper function with SECURITY DEFINER to check admin status without RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

grant execute on function public.is_admin() to anon, authenticated, service_role;

-- profiles: users see their own, admin sees all (non-recursive)
alter table public.profiles enable row level security;
drop policy if exists "users_own_profile" on public.profiles;
drop policy if exists "admin_all_profiles" on public.profiles;

create policy "users_own_profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "users_update_own_profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- addresses
alter table public.addresses enable row level security;
create policy "users_own_addresses" on public.addresses
  for all using (auth.uid() = user_id);
create policy "admin_all_addresses" on public.addresses
  for all using (public.is_admin());

-- products: public read, admin write
alter table public.products enable row level security;
create policy "public_read_products" on public.products
  for select using (true);
create policy "admin_write_products" on public.products
  for all using (
    public.is_admin()
  );

-- categories: public read, admin write
alter table public.categories enable row level security;
create policy "public_read_categories" on public.categories for select using (true);
create policy "admin_write_categories" on public.categories
  for all using (
    public.is_admin()
  );

-- collections: public read, admin write
alter table public.collections enable row level security;
create policy "public_read_collections" on public.collections for select using (true);
create policy "admin_write_collections" on public.collections
  for all using (
    public.is_admin()
  );

-- wishlists: users own theirs
alter table public.wishlists enable row level security;
create policy "users_own_wishlist" on public.wishlists
  for all using (auth.uid() = user_id);

-- cart_items: users own theirs
alter table public.cart_items enable row level security;
create policy "users_own_cart" on public.cart_items
  for all using (auth.uid() = user_id);

-- orders: users see their own, admin sees all
alter table public.orders enable row level security;
create policy "users_own_orders" on public.orders
  for select using (auth.uid() = user_id);
create policy "users_insert_orders" on public.orders
  for insert with check (auth.uid() = user_id or user_id is null);
create policy "admin_all_orders" on public.orders
  for all using (
    public.is_admin()
  );

-- order_items: same as orders
alter table public.order_items enable row level security;
create policy "users_own_order_items" on public.order_items
  for select using (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );
create policy "admin_all_order_items" on public.order_items
  for all using (
    public.is_admin()
  );

-- order_status_history: same visibility as orders
alter table public.order_status_history enable row level security;
create policy "users_see_own_order_history" on public.order_status_history
  for select using (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );
create policy "admin_all_history" on public.order_status_history
  for all using (
    public.is_admin()
  );

-- reviews: approved reviews are public, users manage their own
alter table public.reviews enable row level security;
create policy "public_approved_reviews" on public.reviews
  for select using (status = 'approved');
create policy "users_own_reviews" on public.reviews
  for all using (auth.uid() = user_id);
create policy "admin_all_reviews" on public.reviews
  for all using (
    public.is_admin()
  );

-- coupons: public read active, admin manages all
alter table public.coupons enable row level security;
create policy "public_read_active_coupons" on public.coupons
  for select using (active = true);
create policy "admin_all_coupons" on public.coupons
  for all using (
    public.is_admin()
  );

-- newsletter: insert only for public
alter table public.newsletter_subscribers enable row level security;
create policy "public_subscribe" on public.newsletter_subscribers
  for insert with check (true);
create policy "admin_read_subscribers" on public.newsletter_subscribers
  for select using (
    public.is_admin()
  );

-- blog: public read published
alter table public.blog_posts enable row level security;
create policy "public_read_published_posts" on public.blog_posts
  for select using (published = true);
create policy "admin_all_posts" on public.blog_posts
  for all using (
    public.is_admin()
  );

-- ============================================================
-- ADMIN AUDIT LOG (append-only — no DELETE policy for anyone)
-- ============================================================
create table public.admin_audit_log (
  id           uuid primary key default uuid_generate_v4(),
  admin_id     uuid not null references public.profiles(id) on delete set null,
  admin_email  text not null,
  action       text not null,
  table_name   text not null,
  record_id    text,
  old_value    jsonb,
  new_value    jsonb,
  ip_address   text,
  created_at   timestamptz not null default now()
);

-- Index for fast lookups
create index audit_log_admin_idx on public.admin_audit_log(admin_id);
create index audit_log_created_idx on public.admin_audit_log(created_at desc);

-- RLS: admins can read, everyone can insert, NO ONE can delete or update
alter table public.admin_audit_log enable row level security;

create policy "admin_read_audit_log" on public.admin_audit_log
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "authenticated_insert_audit" on public.admin_audit_log
  for insert with check (auth.uid() = admin_id);

-- Explicitly NO update or delete policy — logs are immutable


-- ============================================================
-- MISSING PATCHES (added to fix runtime errors)
-- ============================================================

-- increment_coupon_usage: called from checkout after successful order
-- Uses a security definer so it can bypass RLS
create or replace function public.increment_coupon_usage(p_code text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.coupons
  set used_count = coalesce(used_count, 0) + 1
  where code = p_code;
end;
$$;

-- Allow guests (anon) to insert order_items as long as the order exists
-- and was created by them (order has null user_id for guests)
create policy "guest_insert_order_items" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders
      where id = order_id
        and (user_id = auth.uid() or user_id is null)
    )
  );

-- Allow anyone to insert order_status_history for their own orders
create policy "users_insert_order_history" on public.order_status_history
  for insert with check (
    exists (
      select 1 from public.orders
      where id = order_id
        and (user_id = auth.uid() or user_id is null)
    )
  );


-- ============================================================
-- STORAGE BUCKET FOR PRODUCT IMAGES
-- Run this in Supabase SQL Editor (Storage section)
-- ============================================================

-- Create the product-images bucket (public so images load in the store)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,  -- 5MB max per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do nothing;

-- Allow admins to upload images
create policy "admin_upload_product_images" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow admins to update (replace) images
create policy "admin_update_product_images" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow admins to delete images
create policy "admin_delete_product_images" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow anyone (including guests) to view product images
create policy "public_read_product_images" on storage.objects
  for select
  using (bucket_id = 'product-images');

-- ============================================================
-- PRODUCT ENHANCEMENTS — run these ALTER statements if schema
-- was already applied. If running fresh, these are harmless.
-- ============================================================

-- Key highlights (Flipkart-style): array of {label, value} pairs
alter table public.products
  add column if not exists highlights jsonb not null default '[]';

-- Specifications: array of {label, value} pairs (tab on PDP)
alter table public.products
  add column if not exists specs jsonb not null default '[]';

-- Custom colors: array of {hex, name} objects
-- NOTE: existing `colors` column stores hex strings for backwards compat.
-- New `custom_colors` stores {hex, name} objects for named colors.
alter table public.products
  add column if not exists custom_colors jsonb not null default '[]';

-- ── Blog enhancements ────────────────────────────────────────
alter table public.blog_posts
  add column if not exists author text not null default 'PEHNAV Team';
alter table public.blog_posts
  add column if not exists read_time integer not null default 5;
alter table public.blog_posts
  add column if not exists tags text[] not null default '{}';
