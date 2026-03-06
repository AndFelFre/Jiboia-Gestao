-- FIX: Setup inicial com permissões corretas (CORRIGIDO)
-- Execute este script se estiver tendo erro 500 no login

DO $$
DECLARE
  v_org_id UUID;
  v_unit_id UUID;
  v_admin_role_id UUID;
  v_user_id UUID;
  v_count INTEGER;
  v_role_exists BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'INICIANDO CORREÇÃO DO BANCO DE DADOS';
  RAISE NOTICE '========================================';

  -- ============================================
  -- 1. VERIFICAR SE TABELAS EXISTEM
  -- ============================================
  SELECT COUNT(*) INTO v_count 
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'organizations';
  
  IF v_count = 0 THEN
    RAISE EXCEPTION 'Tabela organizations não existe. Execute a migration 001 primeiro!';
  END IF;
  
  RAISE NOTICE '✓ Tabelas verificadas';

  -- ============================================
  -- 2. DESATIVAR RLS TEMPORARIAMENTE (para correção)
  -- ============================================
  ALTER TABLE IF EXISTS organizations DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS units DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS roles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS positions DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS levels DISABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS tracks DISABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE '✓ RLS desativado temporariamente';

  -- ============================================
  -- 3. CRIAR/CORRIGIR ROLES PADRÃO
  -- ============================================
  -- Verificar e criar cada role individualmente
  
  -- Admin
  SELECT EXISTS(SELECT 1 FROM roles WHERE name = 'admin') INTO v_role_exists;
  IF NOT v_role_exists THEN
    INSERT INTO roles (id, name, permissions)
    VALUES (gen_random_uuid(), 'admin', '{"all": true}'::jsonb);
    RAISE NOTICE '✓ Role admin criada';
  ELSE
    UPDATE roles SET permissions = '{"all": true}'::jsonb WHERE name = 'admin';
    RAISE NOTICE '✓ Role admin atualizada';
  END IF;
  
  -- Leader
  SELECT EXISTS(SELECT 1 FROM roles WHERE name = 'leader') INTO v_role_exists;
  IF NOT v_role_exists THEN
    INSERT INTO roles (id, name, permissions)
    VALUES (gen_random_uuid(), 'leader', '{"manage_team": true, "evaluations": true, "recruitment": true}'::jsonb);
    RAISE NOTICE '✓ Role leader criada';
  ELSE
    UPDATE roles SET permissions = '{"manage_team": true, "evaluations": true, "recruitment": true}'::jsonb WHERE name = 'leader';
    RAISE NOTICE '✓ Role leader atualizada';
  END IF;
  
  -- Employee
  SELECT EXISTS(SELECT 1 FROM roles WHERE name = 'employee') INTO v_role_exists;
  IF NOT v_role_exists THEN
    INSERT INTO roles (id, name, permissions)
    VALUES (gen_random_uuid(), 'employee', '{"view_own": true, "routines": true}'::jsonb);
    RAISE NOTICE '✓ Role employee criada';
  ELSE
    UPDATE roles SET permissions = '{"view_own": true, "routines": true}'::jsonb WHERE name = 'employee';
    RAISE NOTICE '✓ Role employee atualizada';
  END IF;
  
  -- Recruiter
  SELECT EXISTS(SELECT 1 FROM roles WHERE name = 'recruiter') INTO v_role_exists;
  IF NOT v_role_exists THEN
    INSERT INTO roles (id, name, permissions)
    VALUES (gen_random_uuid(), 'recruiter', '{"recruitment": true}'::jsonb);
    RAISE NOTICE '✓ Role recruiter criada';
  ELSE
    UPDATE roles SET permissions = '{"recruitment": true}'::jsonb WHERE name = 'recruiter';
    RAISE NOTICE '✓ Role recruiter atualizada';
  END IF;
  
  SELECT id INTO v_admin_role_id FROM roles WHERE name = 'admin';
  RAISE NOTICE '✓ Roles configuradas. Admin ID: %', v_admin_role_id;

  -- ============================================
  -- 4. CRIAR ORGANIZAÇÃO
  -- ============================================
  INSERT INTO organizations (id, name, slug, settings)
  VALUES (
    gen_random_uuid(),
    'RG Digital', 
    'rg-digital',
    '{"timezone": "America/Sao_Paulo", "currency": "BRL"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_org_id;
  
  RAISE NOTICE '✓ Organização criada. ID: %', v_org_id;

  -- ============================================
  -- 5. CRIAR UNIDADE
  -- ============================================
  INSERT INTO units (id, org_id, name, parent_id)
  VALUES (gen_random_uuid(), v_org_id, 'Matriz', NULL)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_unit_id;
  
  IF v_unit_id IS NULL THEN
    SELECT id INTO v_unit_id FROM units WHERE org_id = v_org_id AND name = 'Matriz';
  END IF;
  
  RAISE NOTICE '✓ Unidade criada. ID: %', v_unit_id;

  -- ============================================
  -- 6. CRIAR/ATUALIZAR USUÁRIO NO AUTH
  -- ============================================
  -- Verificar se usuário existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'andreadm@adm.com';
  
  IF v_user_id IS NULL THEN
    -- Criar novo usuário
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
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
      '', '', '', ''
    )
    RETURNING id INTO v_user_id;
    
    RAISE NOTICE '✓ Novo usuário criado no auth. ID: %', v_user_id;
  ELSE
    -- Atualizar senha
    UPDATE auth.users 
    SET encrypted_password = crypt('123456', gen_salt('bf')),
        email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = v_user_id;
    
    RAISE NOTICE '✓ Usuário existente atualizado. ID: %', v_user_id;
  END IF;

  -- ============================================
  -- 7. CRIAR/ATUALIZAR USUÁRIO NA TABELA users
  -- ============================================
  INSERT INTO users (
    id, org_id, unit_id, role_id, email, full_name, status
  )
  VALUES (
    v_user_id, v_org_id, v_unit_id, v_admin_role_id, 
    'andreadm@adm.com', 'Administrador', 'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    org_id = EXCLUDED.org_id,
    unit_id = EXCLUDED.unit_id,
    role_id = EXCLUDED.role_id,
    full_name = EXCLUDED.full_name,
    status = EXCLUDED.status,
    updated_at = NOW();
  
  RAISE NOTICE '✓ Usuário sincronizado na tabela users';

  -- ============================================
  -- 8. REATIVAR RLS
  -- ============================================
  ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS units ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS roles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS positions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS levels ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS tracks ENABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE '✓ RLS reativado';

  -- ============================================
  -- 9. CRIAR POLÍTICA TEMPORÁRIA PARA SETUP
  -- ============================================
  -- Esta política permite que qualquer um autenticado veja tudo
  -- durante o desenvolvimento. REMOVA EM PRODUÇÃO!
  
  DROP POLICY IF EXISTS temp_allow_all ON organizations;
  DROP POLICY IF EXISTS temp_allow_all ON units;
  DROP POLICY IF EXISTS temp_allow_all ON users;
  DROP POLICY IF EXISTS temp_allow_all ON roles;
  
  CREATE POLICY temp_allow_all ON organizations FOR ALL TO authenticated USING (true);
  CREATE POLICY temp_allow_all ON units FOR ALL TO authenticated USING (true);
  CREATE POLICY temp_allow_all ON users FOR ALL TO authenticated USING (true);
  CREATE POLICY temp_allow_all ON roles FOR ALL TO authenticated USING (true);
  
  RAISE NOTICE '✓ Políticas temporárias criadas';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CORREÇÃO CONCLUÍDA!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Credenciais:';
  RAISE NOTICE '  Email: andreadm@adm.com';
  RAISE NOTICE '  Senha: 123456';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  ATENÇÃO: Políticas temporárias ativas!';
  RAISE NOTICE '========================================';

END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT 
  'Usuários no auth:' as info,
  COUNT(*) as total
FROM auth.users 
WHERE email = 'andreadm@adm.com'
UNION ALL
SELECT 
  'Usuários na tabela:',
  COUNT(*)
FROM users 
WHERE email = 'andreadm@adm.com'
UNION ALL
SELECT 
  'Organizações:',
  COUNT(*)
FROM organizations;
