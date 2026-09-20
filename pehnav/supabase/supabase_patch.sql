-- ============================================================
-- PEHNAV — Supabase Schema Patch
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- 1. Add custom_colors column (named color objects {hex, name})
alter table public.products
  add column if not exists custom_colors jsonb not null default '[]';

-- 2. Add highlights column (Flipkart-style key highlights)
alter table public.products
  add column if not exists highlights jsonb not null default '[]';

-- 3. Add specs column (Specifications tab on product page)
alter table public.products
  add column if not exists specs jsonb not null default '[]';

-- 4. Add color_images column (per-color image mapping for Flipkart-style color switching)
-- Structure: [{hex: "#000000", name: "Black", images: ["url1", "url2"]}]
alter table public.products
  add column if not exists color_images jsonb not null default '[]';

-- 5. Make sure gallery is present (some old rows may lack it)
alter table public.products
  add column if not exists gallery text[] not null default '{}';

-- 6. Fix admin_audit_log RLS — allow admins to read and insert
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'admin_audit_log'
      and policyname = 'admin_read_audit'
  ) then
    create policy "admin_read_audit" on public.admin_audit_log
      for select using (
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'admin_audit_log'
      and policyname = 'admin_insert_audit'
  ) then
    create policy "admin_insert_audit" on public.admin_audit_log
      for insert with check (
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      );
  end if;
end$$;

-- 7. Add author, read_time, tags, body to blog_posts if not present
alter table public.blog_posts
  add column if not exists author text not null default 'PEHNAV Team';
alter table public.blog_posts
  add column if not exists read_time integer not null default 5;
alter table public.blog_posts
  add column if not exists tags text[] not null default '{}';
alter table public.blog_posts
  add column if not exists body_en text not null default '';
alter table public.blog_posts
  add column if not exists body_hi text not null default '';
alter table public.blog_posts
  add column if not exists published boolean not null default false;
alter table public.blog_posts
  add column if not exists published_at timestamptz;
alter table public.blog_posts
  add column if not exists image_url text not null default '';

-- 8. Verify what was created
select
  column_name,
  data_type,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'products'
  and column_name in ('custom_colors','highlights','specs','color_images','gallery')
order by column_name;
