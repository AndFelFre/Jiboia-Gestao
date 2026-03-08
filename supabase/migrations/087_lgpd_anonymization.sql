-- Migration 087: LGPD Anonymization (Right to be Forgotten)
-- Goal: Permitir o expurgo de PII (Personally Identifiable Information) preservando integridade estatística.

BEGIN;

CREATE OR REPLACE FUNCTION public.anonymize_user(target_user_id uuid)
RETURNS void AS $$
DECLARE
    org_id_val uuid;
    is_last_admin boolean;
BEGIN
    -- 1. Capturar contexto
    SELECT org_id INTO org_id_val FROM public.users WHERE id = target_user_id;

    -- 2. Validar se não é o último admin da org (prevenção de suicídio de gestão)
    SELECT COUNT(*) = 1 INTO is_last_admin 
    FROM public.users 
    WHERE org_id = org_id_val 
    AND role_id IN (SELECT id FROM public.roles WHERE name = 'ADMIN')
    AND deleted_at IS NULL;

    IF is_last_admin AND (SELECT role_id FROM public.users WHERE id = target_user_id) IN (SELECT id FROM public.roles WHERE name = 'ADMIN') THEN
        RAISE EXCEPTION 'Não é possível anonimizar o último administrador da organização.';
    END IF;

    -- 3. Injetar contexto de auditoria (sem salvar os dados antigos no log de delta)
    -- Notamos que o Trigger de auditoria pode tentar salvar o 'old_values'. 
    -- Para conformidade real, o processo de anonimização deve ser tratado como uma ação especial.
    PERFORM set_config('app.audit_action', 'ANONYMIZE', true);

    -- 4. Executar Hard Masking na tabela public.users
    UPDATE public.users 
    SET 
        full_name = 'Usuário Anonimizado',
        email = 'anon_' || substr(target_user_id::text, 1, 8) || '@jiboia.local',
        document = NULL,
        phone = NULL,
        avatar_url = NULL,
        updated_at = now(),
        deleted_at = now() -- Marcamos como deletado (Soft Delete) simultaneamente
    WHERE id = target_user_id;

    -- 5. (Opcional) Expurgar do Auth do Supabase se necessário, 
    -- mas o foco LGPD aqui é a tabela de negócio onde o analytics reside.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
