-- Migration 091: Superadmin Universal Bypass
-- O superadmin (desenvolvedor) não está vinculado a nenhuma organização.
-- Ele precisa de acesso total para testar e avaliar todo o sistema.
-- Esta migração adiciona uma política de bypass em TODAS as tabelas com RLS.

-- Estratégia: Em vez de criar N políticas, usamos BYPASSRLS no papel do usuário.
-- Isso é a abordagem oficial do PostgreSQL para superadmins.

-- Mas como o Supabase não permite alterar roles diretamente a partir do SQL Editor,
-- usamos a abordagem de policies dinâmicas em todas as tabelas com RLS.

DO $$
DECLARE
    t RECORD;
    policy_name TEXT;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename NOT IN ('schema_migrations', '_supabase_migrations')
    LOOP
        policy_name := 'superadmin_bypass_' || t.tablename;
        
        -- Dropar se já existe (idempotente)
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, t.tablename);
        
        -- Criar bypass: se o role é 'admin', acessa tudo (SELECT, INSERT, UPDATE, DELETE)
        BEGIN
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = ''admin'')',
                policy_name, t.tablename
            );
        EXCEPTION WHEN OTHERS THEN
            -- Ignora tabelas sem RLS habilitado
            RAISE NOTICE 'Não foi possível criar policy em %: %', t.tablename, SQLERRM;
        END;
    END LOOP;
END $$;
