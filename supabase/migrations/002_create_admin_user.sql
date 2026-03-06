-- Script para criar o primeiro usuário admin
-- Execute no SQL Editor do Supabase

DO $$
DECLARE
  v_org_id UUID;
  v_unit_id UUID;
  v_admin_role_id UUID;
  v_user_id UUID;
  v_user_exists BOOLEAN;
BEGIN
  -- ============================================
  -- 1. Criar Organização (se não existir)
  -- ============================================
  INSERT INTO organizations (name, slug, settings)
  VALUES (
    'RG Digital', 
    'rg-digital',
    '{"timezone": "America/Sao_Paulo", "currency": "BRL"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_org_id;

  RAISE NOTICE 'Organização ID: %', v_org_id;

  -- ============================================
  -- 2. Criar Unidade Matriz (se não existir)
  -- ============================================
  INSERT INTO units (org_id, name, parent_id)
  VALUES (v_org_id, 'Matriz', NULL)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_unit_id;

  -- Se já existe, pegar o ID
  IF v_unit_id IS NULL THEN
    SELECT id INTO v_unit_id FROM units WHERE org_id = v_org_id AND name = 'Matriz';
  END IF;

  RAISE NOTICE 'Unidade ID: %', v_unit_id;

  -- ============================================
  -- 3. Buscar ID do papel Admin
  -- ============================================
  SELECT id INTO v_admin_role_id FROM roles WHERE name = 'admin';
  
  IF v_admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Papel admin não encontrado. Execute a migration 001 primeiro.';
  END IF;

  RAISE NOTICE 'Role Admin ID: %', v_admin_role_id;

  -- ============================================
  -- 4. Criar usuário no auth.users (Supabase Auth)
  -- ============================================
  -- Verifica se usuário já existe
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'andreadm@adm.com') INTO v_user_exists;
  
  IF v_user_exists THEN
    -- Atualiza senha do usuário existente
    UPDATE auth.users 
    SET encrypted_password = crypt('123456', gen_salt('bf')),
        updated_at = NOW()
    WHERE email = 'andreadm@adm.com'
    RETURNING id INTO v_user_id;
    
    RAISE NOTICE 'Usuário atualizado: %', v_user_id;
  ELSE
    -- Cria novo usuário com proteção contra erro de Scan (NULL to String)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'andreadm@adm.com',
      crypt('123456', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Administrador"}'::jsonb,
      NOW(),
      NOW(),
      '', -- confirmation_token
      '', -- email_change
      '', -- email_change_token_new
      ''  -- recovery_token
    )
    RETURNING id INTO v_user_id;
    
    RAISE NOTICE 'Novo usuário criado: %', v_user_id;
  END IF;

  -- ============================================
  -- 5. Criar/Atualizar usuário na tabela users
  -- ============================================
  INSERT INTO users (
    id,
    org_id,
    unit_id,
    role_id,
    email,
    full_name,
    status
  )
  VALUES (
    v_user_id,
    v_org_id,
    v_unit_id,
    v_admin_role_id,
    'andreadm@adm.com',
    'Administrador',
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    org_id = EXCLUDED.org_id,
    unit_id = EXCLUDED.unit_id,
    role_id = EXCLUDED.role_id,
    full_name = EXCLUDED.full_name,
    status = EXCLUDED.status,
    updated_at = NOW();

  RAISE NOTICE '============================================';
  RAISE NOTICE 'Usuário admin criado/atualizado com sucesso!';
  RAISE NOTICE 'Email: andreadm@adm.com';
  RAISE NOTICE 'Senha: 123456';
  RAISE NOTICE '============================================';

END $$;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Rode esta query para verificar:
/*
SELECT 
  u.email,
  u.full_name,
  u.status,
  r.name as role,
  o.name as organization,
  un.name as unit
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN organizations o ON u.org_id = o.id
JOIN units un ON u.unit_id = un.id
WHERE u.email = 'andreadm@adm.com';
*/
