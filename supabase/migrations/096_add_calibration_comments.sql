-- Migration 096: Refinamento de Auditoria e Sincronização de Schema V2
-- Esta migração garante que os pilares da Performance V2 existam antes de adicionar os campos de auditoria.

-- 1. Garantir existência da tabela v2 (se a 068 falhou ou não rodou)
CREATE TABLE IF NOT EXISTS public.performance_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    leader_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft',
    reference_period_start DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_period_end DATE NOT NULL DEFAULT (CURRENT_DATE + interval '3 months'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.1 Garantir colunas RUA e Feedback (Base da 068)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_evaluations' AND column_name='rua_resilience') THEN
        ALTER TABLE public.performance_evaluations ADD COLUMN rua_resilience SMALLINT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_evaluations' AND column_name='rua_utility') THEN
        ALTER TABLE public.performance_evaluations ADD COLUMN rua_utility SMALLINT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_evaluations' AND column_name='rua_ambition') THEN
        ALTER TABLE public.performance_evaluations ADD COLUMN rua_ambition SMALLINT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_evaluations' AND column_name='rua_comments') THEN
        ALTER TABLE public.performance_evaluations ADD COLUMN rua_comments TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_evaluations' AND column_name='overall_comments') THEN
        ALTER TABLE public.performance_evaluations ADD COLUMN overall_comments TEXT;
    END IF;
END $$;

-- 2. Garantir colunas de Calibração (se a 069 falhou ou não rodou)
DO $$ 
BEGIN 
    -- Enum de Quadrantes
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nine_box_quadrant') THEN
        CREATE TYPE public.nine_box_quadrant AS ENUM (
            'dilemma', 'rising_star', 'star', 
            'questionable', 'critical_keeper', 'future_star', 
            'risk', 'effective_specialist', 'solid_professional'
        );
    END IF;

    -- Colunas Estratégicas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_evaluations' AND column_name='potential_score') THEN
        ALTER TABLE public.performance_evaluations ADD COLUMN potential_score SMALLINT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_evaluations' AND column_name='nine_box_quadrant') THEN
        ALTER TABLE public.performance_evaluations ADD COLUMN nine_box_quadrant public.nine_box_quadrant;
    END IF;
END $$;

-- 3. ADIÇÃO DO CAMPO DE AUDITORIA (Objetivo original da 096)
ALTER TABLE public.performance_evaluations 
ADD COLUMN IF NOT EXISTS calibration_comments TEXT;

COMMENT ON COLUMN public.performance_evaluations.calibration_comments IS 'Justificativa do RH/Admin para a calibração final do 9-Box';

-- 4. Ajustar CHECK constraints para suportar o novo status
ALTER TABLE public.performance_evaluations DROP CONSTRAINT IF EXISTS performance_evaluations_status_check;
ALTER TABLE public.performance_evaluations ADD CONSTRAINT performance_evaluations_status_check 
CHECK (status IN ('draft', 'in_progress', 'pending_calibration', 'closed', 'cancelled'));

-- 5. Garantir vínculo com PDI (se a 068 falhou)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pdi_items' AND column_name='performance_evaluation_id') THEN
        ALTER TABLE public.pdi_items ADD COLUMN performance_evaluation_id UUID REFERENCES public.performance_evaluations(id) ON DELETE CASCADE;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
