-- ============================================================
-- PEHNAV — Security Patches
-- Run this in Supabase SQL Editor AFTER schema.sql
-- Fixes: missing RPC, RLS gaps, order insertion policy
-- ============================================================

-- ── 1. Coupon increment RPC (atomic — prevents race conditions) ───────────────
-- Clients call this; they cannot directly UPDATE coupons table
create or replace function public.increment_coupon_usage(p_code text)
returns void
language plpgsql
security definer  -- runs as DB owner, not the calling user
set search_path = public
as $$
begin
  update public.coupons
  set used_count = used_count + 1
  where code = p_code
    and active = true
    and (max_uses is null or used_count < max_uses)
    and (expires_at is null or expires_at > now());

  if not found then
    raise exception 'Coupon % is invalid, expired, or exhausted', p_code;
  end if;
end;
$$;

-- Revoke direct execute from anon/authenticated — only callable via service role
-- (The edge function verify-payment calls it via service role key)
revoke execute on function public.increment_coupon_usage(text) from anon, authenticated;
grant execute on function public.increment_coupon_usage(text) to service_role;


-- ── 2. Orders RLS — tighten insert policy ─────────────────────────────────────
-- Drop the old policy that allowed user_id = null inserts from anyone
drop policy if exists "users_insert_orders" on public.orders;

-- New policy: only authenticated users can insert, and user_id must match their own ID
create policy "authenticated_insert_orders" on public.orders
  for insert
  with check (auth.uid() = user_id);

-- Allow service_role (edge functions) to do anything
create policy "service_role_all_orders" on public.orders
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- ── 3. Orders — prevent client from updating payment_status directly ──────────
-- Clients should NEVER be able to change payment_status or status directly
-- Only the edge function (service role) can do this
drop policy if exists "users_own_orders" on public.orders;

-- Users can only SELECT their own orders — no UPDATE from client
create policy "users_read_own_orders" on public.orders
  for select
  using (auth.uid() = user_id);


-- ── 4. Order items — prevent insertion without a valid pending order ──────────
drop policy if exists "users_own_order_items" on public.order_items;

-- Clients can insert items only for their own pending orders
create policy "users_insert_own_order_items" on public.order_items
  for insert
  with check (
    exists (
      select 1 from public.orders
      where id = order_id
        and user_id = auth.uid()
        and payment_status = 'pending'
    )
  );

create policy "users_select_own_order_items" on public.order_items
  for select
  using (
    exists (
      select 1 from public.orders
      where id = order_id
        and user_id = auth.uid()
    )
  );

create policy "service_role_all_order_items" on public.order_items
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- ── 5. Coupons — clients can only read active coupons, never write ────────────
drop policy if exists "public_read_active_coupons" on public.coupons;
drop policy if exists "admin_all_coupons" on public.coupons;

create policy "authenticated_read_active_coupons" on public.coupons
  for select
  using (active = true and auth.uid() is not null);  -- must be logged in to use coupons

create policy "service_role_all_coupons" on public.coupons
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "admin_manage_coupons" on public.coupons
  for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ── 6. Reviews — prevent spam, limit to one per user per product ─────────────
drop policy if exists "users_own_reviews" on public.reviews;

-- One review per user per product
create policy "users_insert_reviews" on public.reviews
  for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.reviews
      where product_id = reviews.product_id
        and user_id = auth.uid()
        and status != 'rejected'
    )
  );

create policy "users_read_own_reviews" on public.reviews
  for select
  using (auth.uid() = user_id or status = 'approved');


-- ── 7. Rate limit helper for reviews (block rapid submissions) ─────────────────
create or replace function public.check_review_rate_limit(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
  from public.reviews
  where user_id = p_user_id
    and created_at > now() - interval '1 hour';

  return recent_count < 5;  -- max 5 reviews per hour
end;
$$;


-- ── 8. Admin role check — use security definer function to prevent bypass ─────
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
end;
$$;

-- Update all admin policies to use the function
drop policy if exists "admin_all_profiles" on public.profiles;
create policy "admin_all_profiles" on public.profiles
  for all using (public.is_admin());

drop policy if exists "admin_write_products" on public.products;
create policy "admin_write_products" on public.products
  for all using (public.is_admin());

drop policy if exists "admin_all_orders" on public.orders;
create policy "admin_all_orders" on public.orders
  for all using (public.is_admin());

drop policy if exists "admin_all_reviews" on public.reviews;
create policy "admin_all_reviews" on public.reviews
  for all using (public.is_admin());

drop policy if exists "admin_all_order_items" on public.order_items;
create policy "admin_all_order_items" on public.order_items
  for all using (public.is_admin());

drop policy if exists "admin_read_audit_log" on public.admin_audit_log;
create policy "admin_read_audit_log" on public.admin_audit_log
  for select using (public.is_admin());


-- ── 9. Wishlist — authenticated only, own items ───────────────────────────────
drop policy if exists "users_own_wishlist" on public.wishlists;
create policy "users_own_wishlist" on public.wishlists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── 10. Block any unauthenticated writes across the board ─────────────────────
-- Ensure anon role has zero write access to critical tables
revoke insert, update, delete on public.orders from anon;
revoke insert, update, delete on public.order_items from anon;
revoke insert, update, delete on public.profiles from anon;
revoke insert, update, delete on public.wishlists from anon;
revoke insert, update, delete on public.cart_items from anon;
revoke insert, update, delete on public.reviews from anon;
revoke insert, update, delete on public.coupons from anon;
revoke insert, update, delete on public.admin_audit_log from anon;
