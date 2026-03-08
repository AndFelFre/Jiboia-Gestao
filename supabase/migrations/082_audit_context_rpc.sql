-- Migration 082: Session Context Helper for Auditing
-- Goal: Permitir que a aplicação Next.js injete contexto (ex: motivo) via RPC.

BEGIN;

CREATE OR REPLACE FUNCTION public.set_session_context(key text, value text)
RETURNS void AS $$
BEGIN
  -- Seta uma variável de sessão que pode ser lida pelo audit_trigger_func via current_setting()
  PERFORM set_config(key, value, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.set_session_context(text, text) IS 
'Helper para injetar variáveis de sessão do Postgres (ex: app.audit_reason) a partir do Next.js.';

COMMIT;
