-- Migration 078: Analytics Performance Final (GIN Indexes & Cleanup)
-- Goal: Otimização de buscas JSONB e limpeza de cron jobs legados.

BEGIN;

-- 1. Índice GIN para busca de widgets (ReportBuilder)
-- Permite analisar quais componentes de BI são mais utilizados sem Full Table Scan
CREATE INDEX IF NOT EXISTS idx_custom_reports_config_gin ON public.custom_reports USING GIN (config);

-- 2. Limpeza de agendamento pg_cron (Migrado para orquestração Vercel Cron)
-- O Vercel Cron resolve o problema de dessincronização entre DB e Cache do App Router
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.unschedule('daily-analytics-refresh');
    END IF;
END $$;

-- 3. Adicionar Comentário de Manutenção
COMMENT ON MATERIALIZED VIEW public.mv_performance_org IS 
'Analytics agregado. Manutenção: REFRESH via Vercel Cron para garantir invalidação de cache do Next.js. Monitorar bloat via pg_stat_all_tables.';

COMMIT;

NOTIFY pgrst, 'reload schema';
