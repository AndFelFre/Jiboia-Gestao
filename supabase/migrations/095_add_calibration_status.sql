-- Migration 095: Adicionando status pending_calibration
-- Necessário para o fluxo de calibração do 9-Box

-- 1. Atualizar o CHECK constraint da tabela performance_evaluations
-- Como não podemos alterar um CHECK constraint diretamente de forma fácil, vamos dropar e recriar.

ALTER TABLE public.performance_evaluations 
DROP CONSTRAINT performance_evaluations_status_check;

ALTER TABLE public.performance_evaluations 
ADD CONSTRAINT performance_evaluations_status_check 
CHECK (status IN ('draft', 'in_progress', 'pending_calibration', 'closed', 'cancelled'));

-- 2. Garantir que o snapshot de calibração só seja obrigatório no status 'closed'
ALTER TABLE public.performance_evaluations
DROP CONSTRAINT check_closing_potential;

ALTER TABLE public.performance_evaluations
ADD CONSTRAINT check_closing_potential CHECK (
    (status != 'closed') OR (potential_score IS NOT NULL)
);

NOTIFY pgrst, 'reload schema';
