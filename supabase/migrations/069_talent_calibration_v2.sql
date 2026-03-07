-- Migration 069: Calibração de Talentos (9-Box Matrix)
-- Implementa campos de potencial e snapshot de quadrante para visão estratégica.

-- 1. Criação do Enum de Quadrantes 9-Box (Snapshot)
-- Valores fixos para evitar inconsistência de nomenclatura.
DO $$ BEGIN
    CREATE TYPE public.nine_box_quadrant AS ENUM (
        'dilemma', 'rising_star', 'star', 
        'questionable', 'critical_keeper', 'future_star', 
        'risk', 'effective_specialist', 'solid_professional'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Extensão da Tabela Performance Evaluations
ALTER TABLE public.performance_evaluations 
ADD COLUMN IF NOT EXISTS potential_score SMALLINT CHECK (potential_score BETWEEN 1 AND 3),
ADD COLUMN IF NOT EXISTS potential_comments TEXT,
ADD COLUMN IF NOT EXISTS performance_bucket SMALLINT CHECK (performance_bucket BETWEEN 1 AND 3),
ADD COLUMN IF NOT EXISTS nine_box_quadrant public.nine_box_quadrant,
ADD COLUMN IF NOT EXISTS calibrated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS calibrated_by UUID REFERENCES public.users(id);

-- 3. Constraints de Integridade
-- O quadrante só deve ser preenchido se ambos (desempenho e potencial) estiverem definidos.
ALTER TABLE public.performance_evaluations
ADD CONSTRAINT check_nine_box_consistency CHECK (
    (nine_box_quadrant IS NULL) OR (potential_score IS NOT NULL AND performance_bucket IS NOT NULL)
);

-- Garantir que para fechar o ciclo, o potencial deve ter sido avaliado.
-- Nota: performance_bucket e nine_box_quadrant são preenchidos via trigger ou action no fechamento.
ALTER TABLE public.performance_evaluations
ADD CONSTRAINT check_closing_potential CHECK (
    (status != 'closed') OR (potential_score IS NOT NULL)
);

-- 4. RLS - Segurança de Dados (Hierarquia)
-- A RLS filtra linhas, então garantimos que apenas quem tem acesso à organização e hierarquia correta veja.
-- A filtragem de colunas específicas (privacidade do colaborador) será feita na camada de Server Action.

-- 5. Índices para o Dashboard 9-Box
CREATE INDEX IF NOT EXISTS idx_perf_eval_snapshot ON public.performance_evaluations(nine_box_quadrant) WHERE status = 'closed';
CREATE INDEX IF NOT EXISTS idx_perf_eval_potential ON public.performance_evaluations(potential_score);

NOTIFY pgrst, 'reload schema';
