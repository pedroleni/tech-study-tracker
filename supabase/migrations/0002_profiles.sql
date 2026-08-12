-- Perfil por usuario. Existe sobre todo para colgar `role` de algo:
-- auth.users es una tabla gestionada por Supabase y no se le añaden
-- columnas propias.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- SOLO select, y solo del propio perfil.
--
-- Deliberadamente NO hay política de insert/update/delete: con RLS
-- activo, lo que no tiene política queda denegado. Si existiera un
-- `for update using (id = auth.uid())`, el usuario podría hacer
-- `update profiles set role = 'admin'` desde el frontend con la anon
-- key — escalada de privilegios directa. La fila la crea el trigger de
-- abajo, no el cliente.
create policy "profiles_select_own" on profiles
  for select using (id = (select auth.uid()));

-- Crea el perfil automáticamente al registrarse un usuario.
--
-- Este SÍ necesita `security definer`, al revés que
-- `category_belongs_to_user()` de 0001_init.sql (que es invoker a
-- propósito): el trigger corre durante el insert en `auth.users`, en un
-- contexto donde `auth.uid()` todavía no es el usuario nuevo, así que
-- sin definer la política de arriba bloquearía el insert.
--
-- `set search_path = ''` es obligatorio en funciones definer (guía
-- oficial de Supabase): sin ello, alguien que pueda crear objetos en un
-- esquema anterior en el search_path podría secuestrar la resolución de
-- nombres y ejecutar código con privilegios elevados. Por eso todas las
-- referencias van cualificadas (`public.profiles`).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- El trigger debe ser idempotente: una fila ya creada no puede hacer
  -- fallar la transacción completa de signup.
  insert into public.profiles (id) values (new.id)
    on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- El trigger solo cubre altas futuras. Rellena los perfiles de las cuentas
-- existentes, que no pueden crearlos desde el cliente porque no hay INSERT RLS.
insert into public.profiles (id)
select id from auth.users
on conflict do nothing;
