-- DIAGNÓSTICO E CORREÇÃO RÁPIDA
-- Execute este script completo

-- 1. Verificar usuário no auth
SELECT '1. Auth Users:' as check_point, COUNT(*) as count, string_agg(email, ', ') as emails
FROM auth.users 
WHERE email = 'andreadm@adm.com';

-- 2. Verificar usuário na tabela users
SELECT '2. Table Users:' as check_point, COUNT(*) as count, string_agg(email, ', ') as emails
FROM users 
WHERE email = 'andreadm@adm.com';

-- 3. Verificar roles
SELECT '3. Roles:' as check_point, COUNT(*) as count, string_agg(name, ', ') as roles
FROM roles;

-- 4. Verificar organização
SELECT '4. Organizations:' as check_point, COUNT(*) as count, string_agg(name, ', ') as orgs
FROM organizations 
WHERE slug = 'rg-digital';

-- 5. Verificar unidade
SELECT '5. Units:' as check_point, COUNT(*) as count, string_agg(name, ', ') as units
FROM units 
WHERE name = 'Matriz';

-- 6. Verificar políticas RLS
SELECT '6. RLS Policies:' as check_point, COUNT(*) as count
FROM pg_policies 
WHERE policyname LIKE 'temp_allow_all';
