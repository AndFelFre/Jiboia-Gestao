-- VERIFICAÇÃO FINAL DO SCHEMA
-- Execute para identificar o problema do erro 500

-- 1. Verificar extensões instaladas
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- 2. Verificar se a função gen_random_uuid existe
SELECT 
  proname,
  prosrc IS NOT NULL as funcao_existe
FROM pg_proc 
WHERE proname = 'gen_random_uuid';

-- 3. Verificar schema auth
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- 4. Verificar permissões na tabela auth.users
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'auth' 
AND table_name = 'users';

-- 5. Tentar uma consulta simples no auth (isso pode revelar o erro)
SELECT count(*) FROM auth.users;
