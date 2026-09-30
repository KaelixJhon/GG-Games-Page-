-- Ejecuta esto en Supabase > SQL Editor.
-- Crea la tabla de publicaciones y activa RLS.
create extension if not exists pgcrypto;

create table if not exists public.addons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  category text not null default 'new' check (category in ('new','featured')),
  image_url text,
  image_path text,
  file_url text,
  file_path text,
  created_at timestamptz not null default now()
);

alter table public.addons enable row level security;

-- Todo visitante puede leer las publicaciones.
drop policy if exists "Public can read addons" on public.addons;
create policy "Public can read addons"
on public.addons for select
using (true);

-- Solo usuarios autenticados pueden crear/editar/borrar.
drop policy if exists "Authenticated can insert addons" on public.addons;
create policy "Authenticated can insert addons"
on public.addons for insert to authenticated
with check (true);

drop policy if exists "Authenticated can update addons" on public.addons;
create policy "Authenticated can update addons"
on public.addons for update to authenticated
using (true) with check (true);

drop policy if exists "Authenticated can delete addons" on public.addons;
create policy "Authenticated can delete addons"
on public.addons for delete to authenticated
using (true);

-- Storage:
-- Crea manualmente un bucket llamado "downloads" y márcalo como PUBLIC.
-- Después puedes añadir políticas de Storage desde Supabase.
-- IMPORTANTE: nunca pongas la service_role key en config.js.
