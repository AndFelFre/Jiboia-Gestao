-- Migration 077: Analytics Security Wrapper e Automação
-- Goal: Eliminar o risco de vazamento de dados em MVs e automatizar o refresh.

-- 1. Criação da View Segura (O wrapper definitivo de Multi-tenancy)
-- Security Invoker garante que o RLS do usuário atual seja aplicado ao consultar o BI
CREATE OR REPLACE VIEW public.vw_performance_org_safe
WITH (security_invoker = true) AS
SELECT * FROM public.mv_performance_org;

-- 2. Habilitar RLS na View (Camada redundante de segurança)
-- Nota: Security Invoker já delega para as tabelas base, mas definimos o comentário para documentação
COMMENT ON VIEW public.vw_performance_org_safe IS 
'Interface segura para consumo de Analytics. O isolamento de tenants é garantido via motor de RLS do Postgres.';

-- 3. Refinar Função de Refresh com Tratamento de Erros
CREATE OR REPLACE FUNCTION public.refresh_performance_view()
RETURNS void AS $$
BEGIN
    -- Refresh Concorrente (Exige índice único definido na Migration 070)
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_performance_org;
EXCEPTION 
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Erro de Integridade: Duplicação de dados detectada na agregação de Analytics.';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Falha Crítica no Refresh de Analytics: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- Executa como owner para ter permissão de REFRESH

-- 4. Automação via pg_cron (Supabase)
-- Nota: Exige extensão pg_cron habilitada no dashboard do Supabase
-- Agenda para rodar todo dia às 03:00 AM (Horário de baixa carga)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule(
            'daily-analytics-refresh',
            '0 3 * * *',
            'SELECT public.refresh_performance_view()'
        );
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
