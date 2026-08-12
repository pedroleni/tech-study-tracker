-- Tech Study Tracker — esquema inicial (categories, technologies) con RLS.
-- Ver specs/plan.md sección 4 y security/security-review-instructions.md.

create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table technologies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'en_progreso', 'completado')),
  priority text not null default 'media'
    check (priority in ('alta', 'media', 'baja')),
  difficulty text not null default 'media'
    check (difficulty in ('facil', 'media', 'dificil')),
  notes text not null default '',
  resources jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index technologies_category_id_idx on technologies(category_id);
create index technologies_user_id_idx on technologies(user_id);
create index categories_user_id_idx on categories(user_id);

-- RLS: obligatorio desde esta primera migración (spec sección 9).
alter table categories enable row level security;
alter table technologies enable row level security;

-- (select auth.uid()) en vez de auth.uid() a secas: Postgres cachea el
-- resultado por statement en lugar de reevaluarlo por fila (5-10x más
-- rápido en tablas grandes; ver .agents/skills/supabase-postgres-best-practices).
create policy "categories_owner_all" on categories
  for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "technologies_owner_all" on technologies
  for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Evita asignar una tecnología a la categoría de otro usuario.
-- SECURITY INVOKER (por defecto, sin declarar "security definer"): el SELECT
-- de abajo ya corre con los permisos del usuario que hace el insert/update, y
-- como RLS ya limita "categories" a sus propias filas, no hace falta (ni
-- conviene) elevar privilegios aquí — ver
-- .agents/skills/supabase-postgres-best-practices/references/security-rls-performance.md
-- sobre los riesgos de security definer mal usado.
create function category_belongs_to_user()
returns trigger as $$
begin
  if not exists (
    select 1 from categories
    where id = new.category_id and user_id = new.user_id
  ) then
    raise exception 'category_id does not belong to user_id';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger technologies_category_owner_check
  before insert or update on technologies
  for each row execute function category_belongs_to_user();

-- Mantiene updated_at al día en cada UPDATE (mencionado en specs/plan.md
-- sección 4 pero no implementado hasta ahora).
create function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger technologies_set_updated_at
  before update on technologies
  for each row execute function set_updated_at();
