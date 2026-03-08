-- Migration 089: PDI Leadership Transfer & RLS JWT Optimization
-- Goal: Automatizar transferência de liderança em PDIs ativos e otimizar RLS via JWT Claims.

BEGIN;

-- 1. Trigger: Transferência Automática de Liderança em Planos PDI Ativos
-- Quando um líder muda de unidade ou é desativado, seus liderados com PDIs ativos
-- devem ter o campo leader_id atualizado automaticamente para o novo líder da unidade.

CREATE OR REPLACE FUNCTION public.pdi_leadership_transfer_func()
RETURNS TRIGGER AS $$
DECLARE
    new_leader_id UUID;
BEGIN
    -- Dispara apenas se o status do usuário mudou para 'inactive' ou se o unit_id mudou
    IF (OLD.status = 'active' AND NEW.status = 'inactive') OR (OLD.unit_id IS DISTINCT FROM NEW.unit_id) THEN
        
        -- Encontrar o novo líder da unidade (o primeiro líder ativo da mesma unidade)
        SELECT u.id INTO new_leader_id
        FROM public.users u
        JOIN public.roles r ON u.role_id = r.id
        WHERE u.unit_id = OLD.unit_id
          AND u.id != OLD.id
          AND u.status = 'active'
          AND r.name IN ('admin', 'leader')
        ORDER BY u.created_at ASC
        LIMIT 1;

        -- Se encontrou um substituto, transfere os PDIs ativos
        IF new_leader_id IS NOT NULL THEN
            UPDATE public.pdi_plans 
            SET leader_id = new_leader_id, updated_at = now()
            WHERE leader_id = OLD.id 
              AND status = 'active';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger na tabela users
DROP TRIGGER IF EXISTS pdi_leadership_transfer ON public.users;
CREATE TRIGGER pdi_leadership_transfer
AFTER UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION pdi_leadership_transfer_func();

-- 2. Otimização de RLS via JWT Claims para PDI
-- Usa auth.jwt() diretamente para evitar sub-selects pesados na tabela users.

-- PDI Plans: Usuário vê o próprio, líder/admin vê da org
DROP POLICY IF EXISTS pdi_plans_select ON public.pdi_plans;
CREATE POLICY pdi_plans_select ON public.pdi_plans
FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR leader_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'leader')
);

DROP POLICY IF EXISTS pdi_plans_manage ON public.pdi_plans;
CREATE POLICY pdi_plans_manage ON public.pdi_plans
FOR ALL TO authenticated USING (
    user_id = auth.uid()
    OR leader_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'leader')
);

-- PDI Items: Acesso via plano (o plano já tem a política)
DROP POLICY IF EXISTS pdi_items_select ON public.pdi_items;
CREATE POLICY pdi_items_select ON public.pdi_items
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.pdi_plans p 
        WHERE p.id = pdi_items.plan_id 
        AND (
            p.user_id = auth.uid() 
            OR p.leader_id = auth.uid()
            OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'leader')
        )
    )
);

DROP POLICY IF EXISTS pdi_items_manage ON public.pdi_items;
CREATE POLICY pdi_items_manage ON public.pdi_items
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.pdi_plans p 
        WHERE p.id = pdi_items.plan_id 
        AND (
            p.user_id = auth.uid() 
            OR p.leader_id = auth.uid()
            OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'leader')
        )
    )
);

COMMIT;
