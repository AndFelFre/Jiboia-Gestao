-- migration 055: Turnover Fields for Users
-- Adiciona campos necessários para rastrear desligamentos e calcular turnover.

DO $$
BEGIN
    RAISE NOTICE '=== ADICIONANDO CAMPOS DE TURNOVER ===';

    -- Adiciona coluna de data de desligamento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'terminated_at') THEN
        ALTER TABLE public.users ADD COLUMN terminated_at TIMESTAMPTZ;
    END IF;

    -- Adiciona coluna de motivo do desligamento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'termination_reason') THEN
        ALTER TABLE public.users ADD COLUMN termination_reason TEXT;
    END IF;

    -- Adiciona coluna de tipo de desligamento (Voluntário/Involuntário)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'termination_type') THEN
        ALTER TABLE public.users ADD COLUMN termination_type TEXT CHECK (termination_type IN ('voluntary', 'involuntary'));
    END IF;

    RAISE NOTICE 'Campos de turnover adicionados com sucesso.';
END $$;

NOTIFY pgrst, 'reload schema';
