-- Migration 079: Analytics Privacy Scaling (Cross-Filter Protection)
-- Goal: Garantir que o anonimato resista a cruzamentos de filtros complexos.

BEGIN;

-- 1. Refinar a Materialized View para incluir dimensões de diversidade e tempo
-- Isso permite o cálculo de sample_size dinâmico no front ou via Secure View
DROP MATERIALIZED VIEW IF EXISTS public.mv_performance_org CASCADE;

CREATE MATERIALIZED VIEW public.mv_performance_org AS
WITH smart_stats AS (
  SELECT 
    pp.user_id,
    COUNT(*) FILTER (WHERE pi.category = 'smart_goal' AND pi.status = 'completed') as completed_goals,
    COUNT(*) FILTER (WHERE pi.category = 'smart_goal') as total_goals
  FROM public.pdi_plans pp
  JOIN public.pdi_items pi ON pi.plan_id = pp.id
  GROUP BY pp.user_id
)
SELECT 
    pe.org_id,
    u.unit_id,
    u.gender, -- Dimensão para análise de diversidade (exige cuidado com anonimato)
    date_trunc('month', pe.closed_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') as period,
    
    -- Dados Brutos para agregação dinâmica na Secure View
    -- A Materialized View agora funciona como um cubo OLAP pré-processado
    COUNT(DISTINCT pe.user_id) as sample_size,
    AVG(pe.rua_resilience) as raw_avg_resilience,
    AVG(pe.rua_utility) as raw_avg_utility,
    AVG(pe.rua_ambition) as raw_avg_ambition
FROM public.performance_evaluations pe
JOIN public.users u ON pe.user_id = u.id
LEFT JOIN smart_stats ss ON ss.user_id = pe.user_id
WHERE pe.status = 'closed'
GROUP BY 1, 2, 3, 4;

-- 2. Recriar View Segura com Lógica de Anonimização Dinâmica
-- Agora o threshold é validado NO MOMENTO DO SELECT, protegendo contra cross-filtering
CREATE OR REPLACE VIEW public.vw_performance_org_safe
WITH (security_invoker = true) AS
SELECT 
    org_id,
    unit_id,
    period,
    gender,
    -- Threshold de Anonimização Dinâmico (Regra de Três)
    -- Se o agrupamento atual isola menos de 3 pessoas, retornamos NULL
    CASE 
        WHEN sample_size >= 3 THEN raw_avg_resilience 
        ELSE NULL 
    END as avg_resilience,
    CASE 
        WHEN sample_size >= 3 THEN raw_avg_utility 
        ELSE NULL 
    END as avg_utility,
    CASE 
        WHEN sample_size >= 3 THEN raw_avg_ambition 
        ELSE NULL 
    END as avg_ambition,
    sample_size
FROM public.mv_performance_org;

-- 3. Otimização de Autovacuum (Gestão de Bloat por Refresh Concorrente)
-- Reduzimos o threshold para limpeza de tuplas mortas na MV
ALTER MATERIALIZED VIEW public.mv_performance_org SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02
);

COMMIT;

NOTIFY pgrst, 'reload schema';
