-- Migração 097: Criar Tabela de Acompanhamento de Rota (RUA)

CREATE TABLE IF NOT EXISTS public.field_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES auth.users(id),
    agent_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Notas 1 a 4 (Obrigatórias)
    score_planning SMALLINT NOT NULL CHECK (score_planning >= 1 AND score_planning <= 4),
    score_connection SMALLINT NOT NULL CHECK (score_connection >= 1 AND score_connection <= 4),
    score_diagnostic SMALLINT NOT NULL CHECK (score_diagnostic >= 1 AND score_diagnostic <= 4),
    
    -- Notas 1 a 4 (Condicionais - Nullable)
    score_negotiation SMALLINT CHECK (score_negotiation IS NULL OR (score_negotiation >= 1 AND score_negotiation <= 4)),
    score_closing SMALLINT CHECK (score_closing IS NULL OR (score_closing >= 1 AND score_closing <= 4)),
    score_retention SMALLINT CHECK (score_retention IS NULL OR (score_retention >= 1 AND score_retention <= 4)),
    
    -- Observações e Planos
    strengths TEXT NOT NULL,
    improvements TEXT NOT NULL,
    next_challenge TEXT NOT NULL,
    feedback_checkpoint TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.field_evaluations ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "Usuários podem ver avaliações da sua organização" ON public.field_evaluations;
CREATE POLICY "Usuários podem ver avaliações da sua organização"
    ON public.field_evaluations
    FOR SELECT
    USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Gestores podem criar avaliações na sua organização" ON public.field_evaluations;
CREATE POLICY "Gestores podem criar avaliações na sua organização"
    ON public.field_evaluations
    FOR INSERT
    WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_field_eval_org_agent ON public.field_evaluations(org_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_field_eval_created_at ON public.field_evaluations(created_at DESC);

-- Comentários para documentação do DB
COMMENT ON TABLE public.field_evaluations IS 'Registros de acompanhamento de rota (RUA) realizados por gestores de campo.';
COMMENT ON COLUMN public.field_evaluations.score_negotiation IS 'Nota condicional. NULL se não houve oportunidade de negociar na rota.';
