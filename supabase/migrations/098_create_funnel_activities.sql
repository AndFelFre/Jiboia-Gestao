-- Migração 098 (CORRIGIDA): Criar Tabela de Estatísticas Diárias de Funil (PSV)
-- Renomeada de funnel_activities para funnel_daily_stats para evitar conflito com tabela de definições existente.

CREATE TABLE IF NOT EXISTS public.funnel_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Métricas de Esforço (PSV)
    prospections INTEGER DEFAULT 0 NOT NULL CHECK (prospections >= 0),
    visits INTEGER DEFAULT 0 NOT NULL CHECK (visits >= 0),
    proposals INTEGER DEFAULT 0 NOT NULL CHECK (proposals >= 0),
    
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Garantir um registro por usuário por dia
    CONSTRAINT unique_user_daily_stats UNIQUE (user_id, date)
);

-- Habilitar RLS
ALTER TABLE public.funnel_daily_stats ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Usuários podem ver suas próprias estatísticas"
    ON public.funnel_daily_stats
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Vendedores podem registrar seu suor diário"
    ON public.funnel_daily_stats
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Vendedores podem atualizar seu suor diário"
    ON public.funnel_daily_stats
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Gestores podem ver estatísticas do time"
    ON public.funnel_daily_stats
    FOR SELECT
    USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Índices
CREATE INDEX idx_funnel_daily_user_date ON public.funnel_daily_stats(user_id, date DESC);
CREATE INDEX idx_funnel_daily_org_date ON public.funnel_daily_stats(org_id, date DESC);

-- Comentário
COMMENT ON TABLE public.funnel_daily_stats IS 'Registro diário de esforço (PSV) para cálculo de taxas de conversão e previsões. Nome alterado para evitar conflito.';
