-- CORREÇÃO FINAL - Verificar e corrigir usuário
-- Execute este script

-- 1. Verificar se usuário existe no auth
SELECT '1. Usuário no Auth:' as status, 
       id, 
       email, 
       email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE email = 'andreadm@adm.com';

-- 2. Verificar se usuário existe na tabela users
SELECT '2. Usuário na tabela users:' as status,
       id,
       email,
       status,
       org_id,
       unit_id,
       role_id
FROM users 
WHERE email = 'andreadm@adm.com';

-- 3. Se não existir na tabela users, criar
INSERT INTO users (id, org_id, unit_id, role_id, email, full_name, status)
SELECT 
  au.id,
  o.id,
  u.id,
  r.id,
  'andreadm@adm.com',
  'Administrador',
  'active'
FROM auth.users au
CROSS JOIN organizations o
CROSS JOIN units u
CROSS JOIN roles r
WHERE au.email = 'andreadm@adm.com'
  AND o.slug = 'rg-digital'
  AND u.name = 'Matriz'
  AND r.name = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'andreadm@adm.com'
  );

-- 4. Verificar novamente
SELECT '3. Verificação final:' as status,
       email,
       status,
       full_name
FROM users 
WHERE email = 'andreadm@adm.com';
