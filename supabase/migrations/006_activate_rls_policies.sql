-- Ativar políticas RLS definitivas (para produção)
-- Execute APÓS confirmar que o sistema está funcionando

DO $$
BEGIN
  RAISE NOTICE 'Ativando políticas RLS definitivas...';

  -- ============================================
  -- 1. REMOVER POLÍTICAS TEMPORÁRIAS
  -- ============================================
  DROP POLICY IF EXISTS temp_allow_all ON organizations;
  DROP POLICY IF EXISTS temp_allow_all ON units;
  DROP POLICY IF EXISTS temp_allow_all ON users;
  DROP POLICY IF EXISTS temp_allow_all ON roles;
  
  RAISE NOTICE '✓ Políticas temporárias removidas';

  -- ============================================
  -- 2. RECRIAR POLÍTICAS DEFINITIVAS
  -- ============================================
  
  -- Organizations
  DROP POLICY IF EXISTS org_select ON organizations;
  DROP POLICY IF EXISTS org_admin_all ON organizations;
  
  CREATE POLICY org_select ON organizations
    FOR SELECT TO authenticated USING (
      EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.org_id = organizations.id
      )
    );

  CREATE POLICY org_admin_all ON organizations
    FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.org_id = organizations.id
        AND users.role_id IN (SELECT id FROM roles WHERE name = 'admin')
      )
    );

  -- Units
  DROP POLICY IF EXISTS units_select ON units;
  DROP POLICY IF EXISTS units_admin_all ON units;
  
  CREATE POLICY units_select ON units
    FOR SELECT TO authenticated USING (
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND (users.unit_id = units.id OR users.org_id = units.org_id)
      )
    );

  CREATE POLICY units_admin_all ON units
    FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND r.name = 'admin'
      )
    );

  -- Users
  DROP POLICY IF EXISTS users_select_own ON users;
  DROP POLICY IF EXISTS users_select_team ON users;
  DROP POLICY IF EXISTS users_admin_all ON users;
  
  CREATE POLICY users_select_own ON users
    FOR SELECT TO authenticated USING (id = auth.uid());

  CREATE POLICY users_select_team ON users
    FOR SELECT TO authenticated USING (
      EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() 
        AND r.name IN ('admin', 'leader')
        AND u.org_id = users.org_id
      )
    );

  CREATE POLICY users_admin_all ON users
    FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND r.name = 'admin'
      )
    );

  RAISE NOTICE '✓ Políticas definitivas criadas';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'POLÍTICAS RLS DEFINITIVAS ATIVADAS!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'O sistema agora está seguro para produção.';
  RAISE NOTICE '========================================';

END $$;

-- Verificar políticas ativas
SELECT 
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
