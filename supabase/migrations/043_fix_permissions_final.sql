-- migration 043: Fix Table Permissions
-- Este script concede as permissões necessárias para as roles do Supabase
-- acessarem as tabelas do esquema public após o reset nuclear.

DO $$
BEGIN
    RAISE NOTICE '=== RESTAURANDO PERMISSÕES DE TABELA ===';

    -- 1. Garantir uso do esquema
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

    -- 2. Conceder permissões em todas as tabelas atuais para as roles do sistema
    -- O RLS cuidará para que um usuário não veja dados de outro, 
    -- mas a permissão de SELECT "bruta" é necessária para o motor funcionar.
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO postgres, service_role;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
    
    -- 3. Conceder permissões em sequências (para IDs automáticos)
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

    -- 4. Garantir que novas tabelas criadas no futuro também tenham essas permissões
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, service_role;

    RAISE NOTICE 'Permissões restauradas com sucesso.';
END $$;

-- Recarregar cache para aplicar as permissões
NOTIFY pgrst, 'reload schema';
