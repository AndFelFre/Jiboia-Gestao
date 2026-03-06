-- Migration 017: Trigger para criar perfil automaticamente no signup
-- Isso elimina o cenário "Usuário autenticado mas não existe em public.users"

-- Função que será chamada pelo trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    org_id,
    unit_id,
    email,
    full_name,
    role_id,
    status,
    created_at,
    updated_at
  )
  values (
    new.id,
    -- org_id: pode ser definido via metadata no signup
    coalesce(
      (new.raw_user_meta_data->>'org_id')::uuid,
      null
    ),
    -- unit_id: pode ser definido via metadata no signup
    coalesce(
      (new.raw_user_meta_data->>'unit_id')::uuid,
      null
    ),
    new.email,
    -- full_name: tenta pegar do metadata ou usa parte do email
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    -- role_id: pega do metadata ou usa 'employee' como padrão
    coalesce(
      (new.raw_user_meta_data->>'role_id')::uuid,
      (select id from public.roles where name = 'employee' limit 1)
    ),
    -- status: pending até aprovação admin (ou active se preferir)
    coalesce(
      new.raw_user_meta_data->>'status',
      'pending'
    ),
    now(),
    now()
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;

-- Trigger que dispara após insert em auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

comment on function public.handle_new_user() is 
  'Cria automaticamente um registro em public.users quando um novo usuário é criado no auth';

comment on trigger on_auth_user_created on auth.users is 
  'Trigger que garante que todo usuário auth tenha um perfil correspondente em public.users';
