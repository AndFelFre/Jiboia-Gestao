-- Diagnóstico completo do banco de dados
-- Execute no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR SE TABELAS EXISTEM
-- ============================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 2. VERIFICAR ESTRUTURA DA TABELA users
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- ============================================
-- 3. VERIFICAR SE RLS ESTÁ ATIVO
-- ============================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 4. VERIFICAR POLÍTICAS RLS
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 5. TESTAR PERMISSÕES (como usuário anônimo)
-- ============================================
-- Descomente para testar:
/*
SET ROLE anon;
SELECT * FROM organizations LIMIT 1;
SELECT * FROM users LIMIT 1;
RESET ROLE;
*/

-- ============================================
-- 6. CORREÇÃO: Garantir que RLS permite acesso inicial
-- ============================================
-- Se você está tendo problemas de acesso, execute estas correções:

-- 6.1 Permitir acesso anônimo temporariamente (apenas para teste!)
-- CREATE POLICY allow_all ON organizations FOR ALL USING (true);
-- CREATE POLICY allow_all ON users FOR ALL USING (true);

-- 6.2 Ou criar usuário de serviço com bypass RLS
-- Nota: Isso requer ajuste na aplicação para usar service_role

-- ============================================
-- 7. VERIFICAR SE HÁ DADOS
-- ============================================
SELECT 'organizations' as tabela, COUNT(*) as total FROM organizations
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'units', COUNT(*) FROM units;

-- ============================================
-- 8. TESTE DE CONSULTA COMPLICADA (que o app faz)
-- ============================================
-- Simula a query que o dashboard faz:
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.status,
  r.name as role_name,
  o.name as org_name,
  un.name as unit_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN organizations o ON u.org_id = o.id
LEFT JOIN units un ON u.unit_id = un.id
LIMIT 5;

-- Se der erro aqui, o problema é nas políticas RLS ou nas foreign keys
