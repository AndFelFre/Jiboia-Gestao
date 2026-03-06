-- migration 052: Fix User Position Relationship
-- Adiciona a chave estrangeira faltante para permitir joins entre users e positions.

DO $$
BEGIN
    RAISE NOTICE '=== CORRIGINDO RELACIONAMENTO USER -> POSITION ===';

    -- Adiciona a chave estrangeira se ela não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_position_id_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT users_position_id_fkey
        FOREIGN KEY (position_id)
        REFERENCES public.positions(id)
        ON DELETE SET NULL;
    END IF;

    RAISE NOTICE 'Relacionamento corrigido com sucesso.';
END $$;

-- Forçar recarga do PostgREST para reconhecer a nova relação
NOTIFY pgrst, 'reload schema';
