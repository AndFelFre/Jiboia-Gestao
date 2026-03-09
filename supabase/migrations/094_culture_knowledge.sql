-- Migração 094: IA de Cultura Blindada e Rate Limit
-- Descrição: Criação da base de conhecimento de cultura por Org e logs de uso para controle de custos.

-- 1. Tabela de Conhecimento de Cultura
CREATE TABLE IF NOT EXISTS public.culture_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('cultura', 'beneficios', 'onboarding', 'ferramentas', 'outros')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para busca rápida por Org
CREATE INDEX IF NOT EXISTS idx_culture_knowledge_org ON public.culture_knowledge(org_id);

-- 2. Tabela de Logs de Uso de IA (Rate Limit)
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    feature_slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice Composto para Blindagem de Performance (Evita gargalo de N+1)
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_time_lookup ON public.ai_usage_logs(user_id, created_at DESC);

-- 3. Políticas de RLS
ALTER TABLE public.culture_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- 4. Função para Limpeza de Logs Antigos (Data Retention de 7 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_ai_logs() RETURNS void AS $$
BEGIN
    DELETE FROM public.ai_usage_logs WHERE created_at < now() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
