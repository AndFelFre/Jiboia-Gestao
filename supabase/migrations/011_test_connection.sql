-- TESTE DE CONEXÃO E PERMISSÕES
-- Execute para verificar se o banco está respondendo

-- 1. Teste básico de conexão
SELECT 'Conexão OK' as teste, NOW() as horario;

-- 2. Verificar se auth.users está acessível
SELECT COUNT(*) as total_users FROM auth.users;

-- 3. Verificar tabelas públicas
SELECT COUNT(*) as total_orgs FROM organizations;
SELECT COUNT(*) as total_users_table FROM users;

-- 4. Testar se a função auth.uid() funciona
SELECT auth.uid() as current_user_id;

-- 5. Verificar versão do Postgres
SELECT version();
