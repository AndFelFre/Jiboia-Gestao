-- Migration 068: Módulo de Avaliação de Desempenho (RUA + SMART)
-- Implementa a entidade central de ciclos e integra metas SMART ao PDI.

-- 1. Estender Categorias de PDI
-- Como pdi_item_category é um ENUM, adicionamos o novo valor.
ALTER TYPE public.pdi_item_category ADD VALUE IF NOT EXISTS 'smart_goal';

-- 2. Entidade Central de Avaliação
CREATE TABLE IF NOT EXISTS public.performance_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    leader_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'closed', 'cancelled')),
    
    -- Período de referência
    reference_period_start DATE NOT NULL,
    reference_period_end DATE NOT NULL,
    
    -- Notas RUA (Comportamental)
    rua_resilience SMALLINT CHECK (rua_resilience BETWEEN 1 AND 5),
    rua_utility SMALLINT CHECK (rua_utility BETWEEN 1 AND 5),
    rua_ambition SMALLINT CHECK (rua_ambition BETWEEN 1 AND 5),
    rua_comments TEXT,
    
    -- Feedback Geral
    overall_comments TEXT,
    
    -- Metadados de fechamento
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES public.users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints de Integridade
    CONSTRAINT check_period_order CHECK (reference_period_start <= reference_period_end),
    CONSTRAINT check_closed_metadata CHECK (
        (status != 'closed') OR (closed_at IS NOT NULL AND closed_by IS NOT NULL)
    )
);

-- 3. Travas de Unicidade
-- Apenas um ciclo ativo (draft ou in_progress) por colaborador
CREATE UNIQUE INDEX idx_unique_active_evaluation 
ON public.performance_evaluations (user_id) 
WHERE status IN ('draft', 'in_progress');

-- 4. Extensão de PDI para suporte a SMART
ALTER TABLE public.pdi_items 
ADD COLUMN IF NOT EXISTS performance_evaluation_id UUID REFERENCES public.performance_evaluations(id) ON DELETE CASCADE;

-- Constraint: se for smart_goal, o vínculo com a avaliação é obrigatório
-- Nota: Usamos CHECK em vez de NOT NULL para permitir que outros itens de PDI continuem sem vínculo.
ALTER TABLE public.pdi_items 
ADD CONSTRAINT check_smart_goal_link 
CHECK (category != 'smart_goal' OR performance_evaluation_id IS NOT NULL);

-- 5. RLS (Row Level Security)
ALTER TABLE public.performance_evaluations ENABLE ROW LEVEL SECURITY;

-- SELECT: Próprio colaborador (se não for draft/cancelled) ou Líder/Admin
CREATE POLICY evaluations_select_policy ON public.performance_evaluations
FOR SELECT USING (
    org_id = public.get_user_org(auth.uid()) AND (
        -- Admin vê tudo
        public.is_admin(auth.uid()) OR
        -- Líder vê seus liderados (mesmo os rascunhos)
        leader_id = auth.uid() OR
        -- Colaborador vê o seu se for publicado ou fechado
        (user_id = auth.uid() AND status IN ('in_progress', 'closed'))
    )
);

-- INSERT/UPDATE: Apenas Líder ou Admin
CREATE POLICY evaluations_write_policy ON public.performance_evaluations
FOR ALL USING (
    org_id = public.get_user_org(auth.uid()) AND (
        public.is_admin(auth.uid()) OR
        leader_id = auth.uid()
    )
);

-- 6. Trigger de Imutabilidade (Freeze)
-- Impede alteração de itens de PDI vinculados a avaliações fechadas
CREATE OR REPLACE FUNCTION public.check_pdi_item_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.performance_evaluation_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.performance_evaluations 
            WHERE id = OLD.performance_evaluation_id AND status = 'closed'
        ) THEN
            RAISE EXCEPTION 'Não é possível alterar ou excluir itens de PDI vinculados a uma avaliação concluída.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_freeze_closed_eval_items
BEFORE UPDATE OR DELETE ON public.pdi_items
FOR EACH ROW EXECUTE FUNCTION public.check_pdi_item_immutability();

-- 7. Trigger para updated_at
CREATE TRIGGER set_performance_evaluations_updated_at 
BEFORE UPDATE ON public.performance_evaluations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices Sugeridos
CREATE INDEX idx_perf_eval_user ON public.performance_evaluations(user_id);
CREATE INDEX idx_perf_eval_leader ON public.performance_evaluations(leader_id);
CREATE INDEX idx_pdi_items_eval ON public.pdi_items(performance_evaluation_id);

NOTIFY pgrst, 'reload schema';
