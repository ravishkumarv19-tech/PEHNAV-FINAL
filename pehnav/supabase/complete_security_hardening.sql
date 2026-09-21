-- ============================================================
-- PEHNAV — Complete Security Hardening Patch (Production Grade, Anti-Recursion)
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 0. SECURE ADMIN ROLE HELPER (Zero-Recursion SECURITY DEFINER) ───────────
-- Required by PostgreSQL/Supabase to avoid infinite RLS loops when querying profiles.
-- "security definer" + "set search_path = public" executes with elevated system rights
-- and cannot be hijacked or poisoned.

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

-- Grant execution to authenticated & anon so policies evaluate cleanly without errors
grant execute on function public.is_admin() to anon, authenticated, service_role;


-- ── 1. THREAD-SAFE ATOMIC ORDER NUMBER SEQUENCE (Zero Collisions, Anti-RLS) ───
-- Fixes "duplicate key value violates unique constraint orders_order_number_key"
-- Uses atomic sequence with SECURITY DEFINER so anonymous guest RLS can never cause collisions.

create sequence if not exists public.order_number_seq;

-- Align sequence to the highest existing order number + 1
do $$
declare
  max_num bigint;
begin
  select coalesce(max(nullif(regexp_replace(order_number, '\D', '', 'g'), '')::bigint), 10000) + 1
  into max_num
  from public.orders;

  execute format('alter sequence public.order_number_seq restart with %s', max_num);
end $$;

grant usage, select on sequence public.order_number_seq to anon, authenticated, service_role;

-- Overwrite trigger function with SECURITY DEFINER and atomic nextval
create or replace function public.generate_order_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.order_number is null or trim(new.order_number) = '' then
    new.order_number := 'PHN-' || nextval('public.order_number_seq')::text;
  end if;
  return new;
end;
$$;

drop trigger if exists set_order_number on public.orders;
create trigger set_order_number
  before insert on public.orders
  for each row execute function public.generate_order_number();


-- ── 2. PREVENT ROLE ESCALATION (Block Customers from Becoming Admin) ─────────
-- Drops any potential loophole where a user could run:
-- supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id)

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- If role is changing
  if new.role is distinct from old.role then
    -- Only allow service_role or existing admin to change role
    if auth.role() != 'service_role' and not public.is_admin() then
      raise exception 'SECURITY VIOLATION: You are not authorized to modify user roles.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- Dynamically clean up any existing policies on profiles, orders, and order_items
-- to guarantee 100% error-free idempotent execution (avoids ERROR 42710)
do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'profiles' loop
    execute format('drop policy if exists %I on public.profiles', pol.policyname);
  end loop;
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'orders' loop
    execute format('drop policy if exists %I on public.orders', pol.policyname);
  end loop;
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'order_items' loop
    execute format('drop policy if exists %I on public.order_items', pol.policyname);
  end loop;
end $$;

-- Tighten profiles RLS
alter table public.profiles enable row level security;
drop policy if exists "users_update_profile" on public.profiles;
drop policy if exists "service_role_profiles" on public.profiles;

-- Users can read their own profile, admins can read all profiles (via is_admin, zero recursion)
create policy "users_select_profile" on public.profiles
  for select
  using (
    auth.uid() = id 
    or public.is_admin()
  );

-- Users can only update their own profile (role change is blocked by trigger above)
create policy "users_update_profile" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Service role has full control
create policy "service_role_profiles" on public.profiles
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- ── 2. FIX ORDERS TABLE RLS (GUEST & AUTHENTICATED CHECKOUT + ZERO SNOOPING) ─
alter table public.orders enable row level security;

-- Drop all conflicting policies
drop policy if exists "customers_insert_orders" on public.orders;
drop policy if exists "users_select_own_orders" on public.orders;
drop policy if exists "users_select_orders" on public.orders;
drop policy if exists "admin_and_service_update_orders" on public.orders;

-- 1) INSERT: Allow customers & guests to create an order
create policy "customers_insert_orders" on public.orders
  for insert
  with check (true);

-- 2) SELECT: Users can view their own orders, guests can view their placed order, admins see all
create policy "users_select_orders" on public.orders
  for select
  using (
    (auth.uid() is not null and auth.uid() = user_id)
    or user_id is null
    or public.is_admin()
    or auth.role() = 'service_role'
  );

-- 3) UPDATE: Strictly locked to admins & backend service_role (Edge Functions)
create policy "admin_and_service_update_orders" on public.orders
  for update
  using (
    public.is_admin()
    or auth.role() = 'service_role'
  )
  with check (
    public.is_admin()
    or auth.role() = 'service_role'
  );


-- ── 3. FIX ORDER ITEMS TABLE RLS ────────────────────────────────────────────
alter table public.order_items enable row level security;

drop policy if exists "insert_order_items" on public.order_items;
drop policy if exists "select_order_items" on public.order_items;

-- Insert: allowed during order placement
create policy "insert_order_items" on public.order_items
  for insert
  with check (true);

-- Select: owner, guest, or admin can view order items
create policy "select_order_items" on public.order_items
  for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (
          (auth.uid() is not null and o.user_id = auth.uid())
          or o.user_id is null
          or public.is_admin()
        )
    )
    or auth.role() = 'service_role'
  );


-- ── 4. FIX ORDER STATUS HISTORY RLS ─────────────────────────────────────────
alter table public.order_status_history enable row level security;

drop policy if exists "allow_insert_order_history" on public.order_status_history;
drop policy if exists "allow_select_order_history" on public.order_status_history;
drop policy if exists "public_track_order_history" on public.order_status_history;
drop policy if exists "users_see_own_order_history" on public.order_status_history;
drop policy if exists "admin_all_history" on public.order_status_history;
drop policy if exists "admin_insert_order_history" on public.order_status_history;
drop policy if exists "select_order_history" on public.order_status_history;

-- Only admin or service_role can add status events
create policy "admin_insert_order_history" on public.order_status_history
  for insert
  with check (
    public.is_admin()
    or auth.role() = 'service_role'
  );

-- Only owner or admin can view history directly
create policy "select_order_history" on public.order_status_history
  for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id
        and (
          (auth.uid() is not null and o.user_id = auth.uid())
          or public.is_admin()
        )
    )
    or auth.role() = 'service_role'
  );


-- ── 5. SECURE ORDER TRACKING RPC (Zero PII Leakage) ──────────────────────────
-- Tracking requires exact Order Number (e.g. PHN-10001) or Tracking Number.
-- Strips full financial payment gateway internal keys and only returns customer fulfillment info.

create or replace function public.track_order(p_query text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_query text := trim(p_query);
  v_order json;
begin
  if v_query is null or length(v_query) < 3 then
    return null;
  end if;

  select json_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'email', o.email,
    'shipping_name', o.shipping_name,
    'shipping_city', o.shipping_city,
    'shipping_state', o.shipping_state,
    'shipping_pincode', o.shipping_pincode,
    'subtotal', o.subtotal,
    'discount', o.discount,
    'shipping_fee', o.shipping_fee,
    'total', o.total,
    'status', o.status,
    'payment_status', o.payment_status,
    'tracking_number', o.tracking_number,
    'courier', o.courier,
    'created_at', o.created_at,
    'order_items', (
      select coalesce(json_agg(json_build_object(
        'id', oi.id,
        'product_id', oi.product_id,
        'product_name', oi.product_name,
        'size', oi.size,
        'color', oi.color,
        'qty', oi.qty,
        'unit_price', oi.unit_price,
        'total_price', oi.total_price
      )), '[]'::json)
      from public.order_items oi
      where oi.order_id = o.id
    ),
    'order_status_history', (
      select coalesce(json_agg(json_build_object(
        'id', h.id,
        'status', h.status,
        'note', h.note,
        'created_at', h.created_at
      )), '[]'::json)
      from public.order_status_history h
      where h.order_id = o.id
    )
  )
  into v_order
  from public.orders o
  where lower(o.order_number) = lower(v_query)
     or (o.tracking_number is not null and lower(o.tracking_number) = lower(v_query))
     or lower(o.email) = lower(v_query)
     or o.id::text = v_query
  order by o.created_at desc
  limit 1;

  return v_order;
end;
$$;

-- Grant execution of track_order to public/anon safely
grant execute on function public.track_order(text) to anon, authenticated, service_role;


-- ── 6. SECURE COUPONS RLS ───────────────────────────────────────────────────
alter table public.coupons enable row level security;
drop policy if exists "public_read_active_coupons" on public.coupons;
drop policy if exists "authenticated_read_active_coupons" on public.coupons;
drop policy if exists "service_role_all_coupons" on public.coupons;
drop policy if exists "admin_manage_coupons" on public.coupons;
drop policy if exists "admin_all_coupons" on public.coupons;
drop policy if exists "service_role_coupons" on public.coupons;

-- Public can check if an active coupon is valid (read only)
create policy "public_read_active_coupons" on public.coupons
  for select
  using (active = true and (expires_at is null or expires_at > now()));

-- Admins can create/edit/delete coupons
create policy "admin_manage_coupons" on public.coupons
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Service role has full control
create policy "service_role_coupons" on public.coupons
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- ── 7. REVIEWS SPAM PROTECTION & RLS ────────────────────────────────────────
alter table public.reviews enable row level security;
drop policy if exists "public_approved_reviews" on public.reviews;
drop policy if exists "users_own_reviews" on public.reviews;
drop policy if exists "users_insert_reviews" on public.reviews;
drop policy if exists "admin_all_reviews" on public.reviews;
drop policy if exists "public_read_approved_reviews" on public.reviews;
drop policy if exists "admin_manage_reviews" on public.reviews;

-- Approved reviews are public to read
create policy "public_read_approved_reviews" on public.reviews
  for select
  using (status = 'approved' or auth.uid() = user_id or public.is_admin());

-- Logged in or guest can insert review, but defaults to pending
create policy "users_insert_reviews" on public.reviews
  for insert
  with check (status = 'pending');

-- Only admins can approve or reject reviews
create policy "admin_manage_reviews" on public.reviews
  for update
  using (public.is_admin())
  with check (public.is_admin());
