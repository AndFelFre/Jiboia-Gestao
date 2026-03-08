-- Migration 075: Refinamento de Segurança e Snapshots de Performance
-- Goal: Ofuscação de dados sensíveis e imutabilidade de hierarquia

-- 1. Adicionar colunas de Snapshot à tabela de avaliações
ALTER TABLE public.performance_evaluations 
ADD COLUMN IF NOT EXISTS final_evaluator_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS manager_at_closure_id UUID REFERENCES public.users(id);

COMMENT ON COLUMN public.performance_evaluations.final_evaluator_id IS 'Usuário que assinou o fechamento do ciclo.';
COMMENT ON COLUMN public.performance_evaluations.manager_at_closure_id IS 'Líder direto do colaborador no momento exato do fechamento (Snapshot).';

-- 2. Criar VIEW segura para o nível USER (Colaborador)
-- ODRIGATÓRIO: WITH (security_invoker = true) para respeitar RLS da tabela base no Supabase
CREATE OR REPLACE VIEW public.vw_employee_evaluations_safe 
WITH (security_invoker = true) 
AS
SELECT 
    id, 
    org_id, 
    user_id, 
    leader_id, 
    status,
    reference_period_start, 
    reference_period_end,
    rua_resilience, 
    rua_utility, 
    rua_ambition, 
    rua_comments,
    overall_comments, 
    created_at, 
    updated_at
FROM public.performance_evaluations;

COMMENT ON VIEW public.vw_employee_evaluations_safe IS 'Abstração segura para colaboradores. Oculta potenciais, 9-box e comentários de calibração.';

-- 3. Índice Único para Refresh Concorrente em Analytics
-- Nota: O índice deve cobrir todas as dimensões de agrupamento da View Materializada
-- Supondo que a view mv_performance_analytics agrupe por org_id e reference_period_end
-- Se houver agrupamento por departamento, adicione department_id aqui.
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_performance_org_period 
-- ON public.mv_performance_analytics (org_id, reference_period_end);

-- 4. Notificar PostgREST
NOTIFY pgrst, 'reload schema';
