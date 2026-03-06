-- migration 042: Final Auth Sanitization
-- Este script resolve o erro 500 (Scan error) higienizando campos NULL no auth.users.

DO $$
BEGIN
    RAISE NOTICE '=== INICIANDO HIGIENIZAÇÃO DE AUTH.USERS ===';

    -- Aplicando a Regra de Ouro: transforma NULL em string vazia em todos os campos de token
    UPDATE auth.users
    SET
      confirmation_token = COALESCE(confirmation_token, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      recovery_token = COALESCE(recovery_token, ''),
      reauthentication_token = COALESCE(reauthentication_token, ''),
      phone_change = COALESCE(phone_change, ''),
      phone_change_token = COALESCE(phone_change_token, '')
    WHERE 
      confirmation_token IS NULL OR 
      email_change IS NULL OR 
      email_change_token_new IS NULL OR 
      recovery_token IS NULL OR
      reauthentication_token IS NULL;

    RAISE NOTICE 'Higienização concluída com sucesso.';
END $$;

NOTIFY pgrst, 'reload schema';
