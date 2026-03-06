-- TESTE DE AUTENTICAÇÃO
-- Verificar se o usuário pode fazer login

-- 1. Verificar detalhes do usuário no auth
SELECT 
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  created_at,
  CASE WHEN encrypted_password IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_senha
FROM auth.users 
WHERE email = 'andreadm@adm.com';

-- 2. Verificar se a senha está hasheada corretamente
-- (apenas verificamos se existe, não mostramos o hash)
SELECT 
  email,
  LENGTH(encrypted_password::text) as tamanho_senha
FROM auth.users 
WHERE email = 'andreadm@adm.com';

-- 3. Testar verificação de senha
SELECT 
  email,
  CASE 
    WHEN encrypted_password = crypt('123456', encrypted_password) 
    THEN 'SENHA CORRETA' 
    ELSE 'SENHA INCORRETA' 
  END as teste_senha
FROM auth.users 
WHERE email = 'andreadm@adm.com';

-- 4. Verificar metadata
SELECT 
  email,
  raw_user_meta_data->>'full_name' as nome
FROM auth.users 
WHERE email = 'andreadm@adm.com';
