-- VERIFICAR SE USUÁRIOS ESTÃO SINCRONIZADOS

-- 1. Verificar ID no auth
SELECT 'Auth' as origem, id, email, created_at
FROM auth.users 
WHERE email = 'andreadm@adm.com';

-- 2. Verificar ID na tabela users
SELECT 'Tabela users' as origem, id, email, org_id, unit_id, role_id, status
FROM users 
WHERE email = 'andreadm@adm.com';

-- 3. Se IDs forem diferentes, atualizar
-- (descomente e ajuste se necessário)
-- UPDATE users 
-- SET id = (SELECT id FROM auth.users WHERE email = 'andreadm@adm.com')
-- WHERE email = 'andreadm@adm.com';

-- 4. Ou deletar e recriar com ID correto
-- DELETE FROM users WHERE email = 'andreadm@adm.com';
-- INSERT INTO users (id, org_id, unit_id, role_id, email, full_name, status)
-- SELECT 
--   au.id,
--   (SELECT id FROM organizations WHERE slug = 'rg-digital'),
--   (SELECT id FROM units WHERE name = 'Matriz' LIMIT 1),
--   (SELECT id FROM roles WHERE name = 'admin'),
--   'andreadm@adm.com',
--   'Administrador',
--   'active'
-- FROM auth.users au
-- WHERE au.email = 'andreadm@adm.com';
