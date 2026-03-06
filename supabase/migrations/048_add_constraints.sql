-- migration 048: Add Missing Unique Constraints
-- Necessário para o funcionamento correto de sementes (seeds) e integridade de dados.

DO $$
BEGIN
    RAISE NOTICE '=== ADICIONANDO RESTRIÇÕES DE UNICIDADE ===';

    -- Adiciona unicidade para cargos por organização
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'positions_org_id_title_key') THEN
        ALTER TABLE public.positions ADD CONSTRAINT positions_org_id_title_key UNIQUE (org_id, title);
    END IF;

    -- Adiciona unicidade para competências por organização
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'skills_org_id_name_key') THEN
        ALTER TABLE public.skills ADD CONSTRAINT skills_org_id_name_key UNIQUE (org_id, name);
    END IF;

    RAISE NOTICE 'Restrições adicionadas com sucesso.';
END $$;
