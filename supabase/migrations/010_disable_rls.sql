-- CORREÇÃO: Desativar RLS completamente para teste
-- Execute este script se continuar dando erro 500

-- 1. Desativar RLS em TODAS as tabelas
ALTER TABLE IF EXISTS organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS units DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS levels DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stage_transitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;

-- 2. Dropar todas as políticas antigas (opcional - para limpar)
DROP POLICY IF EXISTS org_select ON organizations;
DROP POLICY IF EXISTS org_admin_all ON organizations;
DROP POLICY IF EXISTS units_select ON units;
DROP POLICY IF EXISTS units_admin_all ON units;
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_select_team ON users;
DROP POLICY IF EXISTS users_admin_all ON users;
DROP POLICY IF EXISTS temp_allow_all ON organizations;
DROP POLICY IF EXISTS temp_allow_all ON units;
DROP POLICY IF EXISTS temp_allow_all ON users;
DROP POLICY IF EXISTS temp_allow_all ON roles;

-- 3. Verificar status do RLS
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('organizations', 'units', 'users', 'roles', 'positions', 'levels', 'tracks')
ORDER BY tablename;

-- 4. Verificar usuário
SELECT 'Usuario configurado:' as status, email, status 
FROM users 
WHERE email = 'andreadm@adm.com';
