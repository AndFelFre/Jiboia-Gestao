-- Migration 090: Positions Architecture Fix
-- Corrige: RLS multi-tenant, FK formal em track_id, Soft Delete no RLS, proteção de arquivamento.

BEGIN;

-- 1. Limpeza de dados órfãos em track_id (antes de criar FK)
UPDATE public.positions 
SET track_id = NULL 
WHERE track_id IS NOT NULL 
  AND track_id NOT IN (SELECT id FROM public.tracks);

-- 2. Adicionar FK formal em track_id (ON DELETE SET NULL preserva o registro)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_positions_track' AND table_name = 'positions') THEN
        ALTER TABLE public.positions 
        ADD CONSTRAINT fk_positions_track FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Corrigir RLS: Política segura multi-tenant para Admin
-- (admin vê apenas da SUA organização, não de todas)
DROP POLICY IF EXISTS positions_admin_all ON public.positions;
DROP POLICY IF EXISTS positions_isolation ON public.positions;

-- Política principal: todos os autenticados veem os cargos da sua org (ativos)
CREATE POLICY positions_org_read ON public.positions
FOR SELECT TO authenticated
USING (
    org_id = public.get_user_org(auth.uid())
    AND deleted_at IS NULL
);

-- Admin da organização pode gerenciar (INSERT/UPDATE/DELETE) cargos da própria org
CREATE POLICY positions_org_manage ON public.positions
FOR ALL TO authenticated
USING (
    org_id = public.get_user_org(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('admin', 'leader')
);

-- Admin pode visualizar cargos arquivados da própria org (Lixeira)
CREATE POLICY positions_org_archived ON public.positions
FOR SELECT TO authenticated
USING (
    org_id = public.get_user_org(auth.uid())
    AND deleted_at IS NOT NULL
    AND public.get_user_role(auth.uid()) = 'admin'
);

-- 4. Índice Parcial Único para evitar efeito fantasma no Soft Delete
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_position_title_org_active 
ON public.positions (org_id, title) WHERE deleted_at IS NULL;

-- 5. Proteção: Impedir arquivamento de cargo com users ativos
CREATE OR REPLACE FUNCTION public.check_position_archival()
RETURNS TRIGGER AS $$
BEGIN
    -- Só dispara se estamos adicionando deleted_at (arquivamento)
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.users 
            WHERE position_id = NEW.id 
              AND status = 'active' 
              AND deleted_at IS NULL
        ) THEN
            RAISE EXCEPTION 'Não é possível arquivar este cargo pois existem usuários ativos vinculados a ele. Realoque-os antes.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_position_archival_trigger ON public.positions;
CREATE TRIGGER check_position_archival_trigger
BEFORE UPDATE ON public.positions
FOR EACH ROW
EXECUTE FUNCTION public.check_position_archival();

-- 6. Alterar FK de positions para ON DELETE RESTRICT (proteger contra deleção acidental)
DO $$
BEGIN
    -- users -> positions: impedir deletar cargo se há users (mesmo inativos)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'users_position_id_fkey' AND table_name = 'users') THEN
        ALTER TABLE public.users DROP CONSTRAINT users_position_id_fkey;
        ALTER TABLE public.users ADD CONSTRAINT users_position_id_fkey 
            FOREIGN KEY (position_id) REFERENCES public.positions(id) ON DELETE SET NULL;
    END IF;
END $$;

COMMIT;
