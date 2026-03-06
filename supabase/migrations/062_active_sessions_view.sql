-- View para expor sessões ativas com dados do usuário
CREATE OR REPLACE VIEW public.active_sessions AS
SELECT 
    s.id as session_id,
    s.user_id,
    u.full_name,
    u.email,
    u.org_id,
    s.created_at,
    s.updated_at as last_active_at,
    'Oculto' as ip_address,
    'Desktop/Mobile' as user_agent,
    'Desconhecido' as device_type
FROM auth.sessions s
JOIN public.users u ON s.user_id = u.id;

-- Permissões básicas
GRANT SELECT ON public.active_sessions TO authenticated;
GRANT SELECT ON public.active_sessions TO service_role;

-- Função para revogar sessão (Revoke Session)
-- SECURITY DEFINER permite que a função execute com privilégios de superuser
CREATE OR REPLACE FUNCTION public.revoke_user_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_found BOOLEAN;
BEGIN
    DELETE FROM auth.sessions WHERE id = p_session_id;
    GET DIAGNOSTICS v_found = ROW_COUNT;
    RETURN v_found > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.revoke_user_session(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_user_session(UUID) TO service_role;
