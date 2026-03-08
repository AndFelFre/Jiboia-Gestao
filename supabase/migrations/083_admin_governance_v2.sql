-- Migration 083: Admin Governance (Soft Delete & Constraint Hardening)
-- Goal: Preservar histórico e evitar deleções acidentais em massa.

BEGIN;

-- 1. Adicionar colunas de Soft Delete
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.levels ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Refinar Constraints para Segurança de Vínculos (RESTRICT)
-- Remover cascatas perigosas e forçar erro amigável na aplicação

-- Users -> Positions
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_position_id_fkey;
ALTER TABLE public.users 
ADD CONSTRAINT users_position_id_fkey 
FOREIGN KEY (position_id) REFERENCES public.positions(id) ON DELETE RESTRICT;

-- Positions -> Levels
ALTER TABLE public.positions DROP CONSTRAINT IF EXISTS positions_level_id_fkey;
ALTER TABLE public.positions 
ADD CONSTRAINT positions_level_id_fkey 
FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE RESTRICT;

-- Units -> Organizations
ALTER TABLE public.units DROP CONSTRAINT IF EXISTS units_org_id_fkey;
ALTER TABLE public.units 
ADD CONSTRAINT units_org_id_fkey 
FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE RESTRICT;

-- 3. Atualizar Políticas de RLS para respeitar Soft Delete
-- Nota: Isso exige atualização de múltiplos locais. Como exemplo, vamos proteger a visualização global.

-- Helper para filtrar deletados se não for especificado
CREATE OR REPLACE VIEW public.vw_active_organizations AS
SELECT * FROM public.organizations WHERE deleted_at IS NULL;

-- 4. Função para Soft Delete via RPC (Atomicidade)
CREATE OR REPLACE FUNCTION public.soft_delete_record(target_table text, target_id uuid)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE public.%I SET deleted_at = NOW() WHERE id = %L', target_table, target_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

NOTIFY pgrst, 'reload schema';
