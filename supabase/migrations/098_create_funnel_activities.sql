-- Migração 098: Criar Tabela de Funil de Atividades (PSV)

CREATE TABLE IF NOT EXISTS public.funnel_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Métricas de Esforço (PSV)
    prospections INTEGER DEFAULT 0 NOT NULL CHECK (prospections >= 0),
    visits INTEGER DEFAULT 0 NOT NULL CHECK (visits >= 0),
    proposals INTEGER DEFAULT 0 NOT NULL CHECK (proposals >= 0),
    
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Garantir um registro por usuário por dia
    CONSTRAINT unique_user_daily_activity UNIQUE (user_id, date)
);

-- Habilitar RLS
ALTER TABLE public.funnel_activities ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Usuários podem ver suas próprias atividades"
    ON public.funnel_activities
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Vendedores podem registrar seu suor diário"
    ON public.funnel_activities
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Vendedores podem atualizar seu suor diário"
    ON public.funnel_activities
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Gestores podem ver atividades do time"
    ON public.funnel_activities
    FOR SELECT
    USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Índices
CREATE INDEX idx_funnel_user_date ON public.funnel_activities(user_id, date DESC);
CREATE INDEX idx_funnel_org_date ON public.funnel_activities(org_id, date DESC);

-- Comentário
COMMENT ON TABLE public.funnel_activities IS 'Registro diário de esforço (PSV) para cálculo de taxas de conversão e previsões.';
