-- Migration 071: RPC para Atualização de Analytics
-- Permite que o comando REFRESH seja disparado via API.

BEGIN;

CREATE OR REPLACE FUNCTION public.refresh_performance_view()
RETURNS void AS $$
BEGIN
    -- Refresh concorrente para não bloquear leituras
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_performance_org;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissões: Apenas usuários autenticados (a lógica de RBAC é aplicada na Server Action)
GRANT EXECUTE ON FUNCTION public.refresh_performance_view() TO authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
