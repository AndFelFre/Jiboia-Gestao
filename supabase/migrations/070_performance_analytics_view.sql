-- Migration 070: Materialized View para Analytics de Performance Organizacional
-- Implementa agregação de RUA, SMART e Onboarding com foco em escala e anonimização.

BEGIN;

-- 1. Remover se já existir (Garante idempotência)
DROP MATERIALIZED VIEW IF EXISTS public.mv_performance_org;

-- 2. Criar a Materialized View
CREATE MATERIALIZED VIEW public.mv_performance_org AS
WITH smart_stats AS (
  -- Agregamos metas SMART por usuário ANTES do join principal para evitar inflação de linhas
  -- pdi_items.category deve ser 'smart_goal'
  SELECT 
    pp.user_id,
    COUNT(*) FILTER (WHERE pi.category = 'smart_goal' AND pi.status = 'completed') as completed_goals,
    COUNT(*) FILTER (WHERE pi.category = 'smart_goal') as total_goals
  FROM public.pdi_plans pp
  JOIN public.pdi_items pi ON pi.plan_id = pp.id
  GROUP BY pp.user_id
),
onboarding_stats AS (
  -- Agregamos progresso médio de onboarding para análise de correlação
  SELECT 
    user_id,
    AVG(completion_percentage) as avg_onboarding_progress
  FROM public.user_onboarding_progress
  GROUP BY user_id
)
SELECT 
    pe.org_id,
    u.unit_id,
    -- Agrupamento mensal considerando Timezone de Brasília
    date_trunc('month', pe.closed_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') as period,
    
    -- Amostragem distinta de usuários avaliados na cohort
    COUNT(DISTINCT pe.user_id) as sample_size,
    
    -- Médias RUA com Threshold de Anonimização (Mínimo 3 amostras por grupo)
    CASE 
        WHEN COUNT(DISTINCT pe.user_id) >= 3 THEN AVG(pe.rua_resilience) 
        ELSE NULL 
    END as avg_resilience,
    CASE 
        WHEN COUNT(DISTINCT pe.user_id) >= 3 THEN AVG(pe.rua_utility) 
        ELSE NULL 
    END as avg_utility,
    CASE 
        WHEN COUNT(DISTINCT pe.user_id) >= 3 THEN AVG(pe.rua_ambition) 
        ELSE NULL 
    END as avg_ambition,
    
    -- Taxa de Conversão de Metas SMART (Média da Cohort)
    COALESCE(SUM(ss.completed_goals)::float / NULLIF(SUM(ss.total_goals), 0), 0) as smart_conversion_rate,
    
    -- Média de Progresso de Onboarding (Correlação Rampagem vs Performance)
    AVG(os.avg_onboarding_progress) as avg_cohort_rampup_progress

FROM public.performance_evaluations pe
JOIN public.users u ON pe.user_id = u.id
LEFT JOIN smart_stats ss ON ss.user_id = pe.user_id
LEFT JOIN onboarding_stats os ON os.user_id = pe.user_id
WHERE pe.status = 'closed'
GROUP BY 1, 2, 3;

-- 3. Índice Único Obrigatório para permitir REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_perf_org_unique ON public.mv_performance_org (org_id, unit_id, period);

-- 4. Comentários de Segurança
COMMENT ON MATERIALIZED VIEW public.mv_performance_org IS 
'Analytics agregado de performance. IMPORTANTE: Não suporta RLS. Filtragem por org_id deve ser feita via Server Actions/Camada de Aplicação.';

COMMIT;

NOTIFY pgrst, 'reload schema';
