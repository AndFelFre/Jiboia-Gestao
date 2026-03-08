-- Migration 076: PDI Performance e Automação de Liderança
-- Goal: RLS via JWT Claims e Transferência de Liderança

-- 1. RLS via JWT (Alta Performance)
-- Otimiza o banco evitando chamadas repetitivas de funções PL/pgSQL
DROP POLICY IF EXISTS pdi_plans_leader ON public.pdi_plans;
CREATE POLICY pdi_plans_leader ON public.pdi_plans
FOR SELECT USING (
    org_id = (auth.jwt() -> 'user_metadata' ->> 'org_id')::uuid AND (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
        leader_id = auth.uid()
    )
);

DROP POLICY IF EXISTS pdi_items_leader ON public.pdi_items;
CREATE POLICY pdi_items_leader ON public.pdi_items
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.pdi_plans
        WHERE pdi_plans.id = pdi_items.plan_id
        AND pdi_plans.org_id = (auth.jwt() -> 'user_metadata' ->> 'org_id')::uuid
        AND (
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
            pdi_plans.leader_id = auth.uid()
        )
    )
);

-- 2. Trigger de Transferência de Liderança
-- Garante que se um colaborador mudar de líder, os planos ativos sigam o novo gestor
CREATE OR REPLACE FUNCTION public.handle_leader_transfer()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o líder mudou, atualiza os planos de PDI ativos (Development e Rites)
    IF OLD.leader_id IS DISTINCT FROM NEW.leader_id THEN
        UPDATE public.pdi_plans
        SET leader_id = NEW.leader_id
        WHERE user_id = NEW.id AND status = 'active';
        
        -- Log de auditoria interna (opcional, se houver tabela de sistema)
        -- RAISE NOTICE 'Liderança do usuário % transferida para %', NEW.id, NEW.leader_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_leader_transfer ON public.users;
CREATE TRIGGER trigger_leader_transfer
AFTER UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_leader_transfer();

-- 3. Índices Parciais para Performance de Compliance
CREATE INDEX IF NOT EXISTS idx_pdi_items_rites_only 
ON public.pdi_items (plan_id) 
WHERE category = 'leadership_rite';

-- 4. Notificar PostgREST
NOTIFY pgrst, 'reload schema';
