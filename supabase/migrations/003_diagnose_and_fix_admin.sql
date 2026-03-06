-- Diagnóstico e correção do usuário admin
-- Execute no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR SE USUÁRIO EXISTE
-- ============================================
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'andreadm@adm.com';

-- ============================================
-- 2. VERIFICAR SE EXISTE NA TABELA users
-- ============================================
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.status,
  r.name as role,
  o.name as organization,
  un.name as unit
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN organizations o ON u.org_id = o.id
LEFT JOIN units un ON u.unit_id = un.id
WHERE u.email = 'andreadm@adm.com';

-- ============================================
-- 3. CORREÇÃO: Resetar senha para '123456'
-- ============================================
-- Descomente e execute se necessário:
/*
UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW()  -- Garante que email está confirmado
WHERE email = 'andreadm@adm.com';

SELECT 'Senha resetada com sucesso!' as resultado;
*/

-- ============================================
-- 4. CRIAR USUÁRIO SE NÃO EXISTIR
-- ============================================
-- Descomente e execute se o usuário não existir:
/*
DO $$
DECLARE
  v_org_id UUID;
  v_unit_id UUID;
  v_admin_role_id UUID;
  v_user_id UUID;
BEGIN
  -- Busca IDs
  SELECT id INTO v_org_id FROM organizations WHERE slug = 'rg-digital' LIMIT 1;
  SELECT id INTO v_unit_id FROM units WHERE org_id = v_org_id AND name = 'Matriz' LIMIT 1;
  SELECT id INTO v_admin_role_id FROM roles WHERE name = 'admin' LIMIT 1;
  
  -- Cria usuário no auth
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
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
    NOW()
  )
  RETURNING id INTO v_user_id;
  
  -- Cria na tabela users
  INSERT INTO users (id, org_id, unit_id, role_id, email, full_name, status)
  VALUES (v_user_id, v_org_id, v_unit_id, v_admin_role_id, 'andreadm@adm.com', 'Administrador', 'active');
  
  RAISE NOTICE 'Usuário criado com ID: %', v_user_id;
END $$;
*/
