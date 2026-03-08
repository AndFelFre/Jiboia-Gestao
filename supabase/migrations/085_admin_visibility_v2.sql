-- Migration 085: Admin Visibility Fix (RLS Bypass for Trash)
-- Goal: Permitir que administradores vejam registros deletados para restauração.

BEGIN;

-- 1. Atualizar Políticas de RLS para Organizations
DROP POLICY IF EXISTS "Organizations are viewable by authenticated users" ON public.organizations;
CREATE POLICY "Organizations are viewable by authenticated users" ON public.organizations
FOR SELECT USING (
  deleted_at IS NULL OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'manager')
);

-- 2. Atualizar Políticas de RLS para Units
DROP POLICY IF EXISTS "Units are viewable by authenticated users" ON public.units;
CREATE POLICY "Units are viewable by authenticated users" ON public.units
FOR SELECT USING (
  (org_id = (auth.jwt() -> 'user_metadata' ->> 'org_id')::uuid) AND 
  (deleted_at IS NULL OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'manager'))
);

-- 3. Atualizar Políticas de RLS para Users
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON public.users;
CREATE POLICY "Users are viewable by authenticated users" ON public.users
FOR SELECT USING (
  (org_id = (auth.jwt() -> 'user_metadata' ->> 'org_id')::uuid) AND 
  (deleted_at IS NULL OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'manager'))
);

COMMIT;
