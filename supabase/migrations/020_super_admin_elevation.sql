-- SQL para Elevação Super Admin
-- Execute este script no console do Supabase para ter autonomia completa.

DO $$
DECLARE
  v_admin_role_id UUID;
  v_user_email TEXT := 'SEU_EMAIL_AQUI'; -- SUBSTITUA PELO SEU EMAIL
BEGIN
  -- 1. Garantir que a Role Admin tenha permissões totais
  -- O sistema usa o campo permissions (jsonb) para checagens via requirePermission
  UPDATE roles 
  SET permissions = '{"all": true}'::jsonb 
  WHERE name = 'admin'
  RETURNING id INTO v_admin_role_id;

  IF v_admin_role_id IS NULL THEN
    INSERT INTO roles (name, permissions) 
    VALUES ('admin', '{"all": true}'::jsonb)
    RETURNING id INTO v_admin_role_id;
  END IF;

  -- 2. Tentar elevar o usuário logado e resetar senha
  IF v_user_email != 'SEU_EMAIL_AQUI' THEN
    -- Elevar na tabela de usuários do app
    UPDATE users 
    SET role_id = v_admin_role_id, status = 'active'
    WHERE email = v_user_email;

    -- Resetar senha na tabela auth.users (Supabase Auth)
    UPDATE auth.users 
    SET encrypted_password = crypt('admj123456', gen_salt('bf')),
        email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE email = v_user_email;
    
    RAISE NOTICE 'Usuário % elevado a Admin e senha resetada para admj123456!', v_user_email;
  ELSE
    RAISE NOTICE 'Role Admin garantida. Para elevar um usuário e resetar senha, preencha o email no script.';
  END IF;

  -- 3. (OPCIONAL) Desativar RLS temporariamente para vizualização total (Modo God)
  -- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
  -- ... e assim por diante se desejar pular checagens do banco
  
END $$;
