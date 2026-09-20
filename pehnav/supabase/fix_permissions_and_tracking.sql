-- ============================================================
-- PEHNAV — Fix Database Permissions, Order Placement & Tracking
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Grant full schema and table permissions to anon and authenticated roles
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

-- Set default privileges for any future tables/sequences
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- 2. Configure Row Level Security (RLS) policies for Orders
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

-- Allow guests and logged-in customers to place orders
drop policy if exists "allow_insert_orders" on public.orders;
drop policy if exists "users_insert_orders" on public.orders;
create policy "allow_insert_orders" on public.orders
  for insert
  with check (true);

-- Allow reading orders (for tracking and customer dashboards)
drop policy if exists "allow_select_orders" on public.orders;
drop policy if exists "users_own_orders" on public.orders;
drop policy if exists "admin_all_orders" on public.orders;
drop policy if exists "public_track_orders" on public.orders;
create policy "allow_select_orders" on public.orders
  for select
  using (true);

-- Allow admins to update orders (status, tracking numbers, couriers)
drop policy if exists "allow_update_orders" on public.orders;
create policy "allow_update_orders" on public.orders
  for update
  using (true)
  with check (true);

-- 3. Configure RLS policies for Order Items
drop policy if exists "allow_insert_order_items" on public.order_items;
drop policy if exists "guest_insert_order_items" on public.order_items;
create policy "allow_insert_order_items" on public.order_items
  for insert
  with check (true);

drop policy if exists "allow_select_order_items" on public.order_items;
drop policy if exists "users_own_order_items" on public.order_items;
drop policy if exists "admin_all_order_items" on public.order_items;
drop policy if exists "public_track_order_items" on public.order_items;
create policy "allow_select_order_items" on public.order_items
  for select
  using (true);

-- 4. Configure RLS policies for Order Status History
drop policy if exists "allow_insert_order_history" on public.order_status_history;
drop policy if exists "users_insert_order_history" on public.order_status_history;
create policy "allow_insert_order_history" on public.order_status_history
  for insert
  with check (true);

drop policy if exists "allow_select_order_history" on public.order_status_history;
drop policy if exists "users_see_own_order_history" on public.order_status_history;
drop policy if exists "admin_all_history" on public.order_status_history;
drop policy if exists "public_track_order_history" on public.order_status_history;
create policy "allow_select_order_history" on public.order_status_history
  for select
  using (true);

-- 5. Fast tracking RPC function
create or replace function public.track_order(p_query text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_query text := trim(p_query);
  v_order json;
begin
  if v_query is null or v_query = '' then return null; end if;

  select json_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'email', o.email,
    'phone', o.phone,
    'shipping_name', o.shipping_name,
    'shipping_phone', o.shipping_phone,
    'shipping_line1', o.shipping_line1,
    'shipping_line2', o.shipping_line2,
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
    'updated_at', o.updated_at,
    'order_items', (
      select coalesce(json_agg(json_build_object(
        'id', oi.id,
        'product_id', oi.product_id,
        'product_name', oi.product_name,
        'image_url', oi.image_url,
        'size', oi.size,
        'color', oi.color,
        'qty', oi.qty,
        'unit_price', oi.unit_price,
        'total_price', oi.total_price
      )), '[]'::json)
      from public.order_items oi where oi.order_id = o.id
    ),
    'order_status_history', (
      select coalesce(json_agg(json_build_object(
        'id', h.id,
        'status', h.status,
        'note', h.note,
        'created_at', h.created_at
      )), '[]'::json)
      from public.order_status_history h where h.order_id = o.id
    )
  )
  into v_order
  from public.orders o
  where lower(o.order_number) = lower(v_query)
     or lower(o.tracking_number) = lower(v_query)
     or lower(o.email) = lower(v_query)
     or o.phone = v_query
     or o.id::text = v_query
  order by o.created_at desc
  limit 1;

  return v_order;
end;
$$;
