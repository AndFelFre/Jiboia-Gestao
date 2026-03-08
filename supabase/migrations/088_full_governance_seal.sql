-- Migration 088: Full Governance Seal (Enterprise-Grade)
-- Goal: Estender Auditoria Master e Integridade para 100% da plataforma.

BEGIN;

-- 1. Estender Auditoria Master para tabelas que faltavam (Rede de Segurança Total)
-- O Trigger audit_trigger_func (do 081) agora será aplicado em massa.

DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('audit_logs', 'schema_migrations', '_supabase_migrations')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_master_trigger ON public.%I', rec.table_name);
    EXECUTE format('CREATE TRIGGER audit_master_trigger AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func()', rec.table_name);
  END LOOP;
END $$;

-- 2. Reforçar Integridade em Vagas e Avaliações (Prevenção de Cascata Acidental)
-- Transformamos cascades perigosos em RESTRICT para forçar o arquivamento (Soft Delete) em vez da destruição.

-- Exemplo: Impedir que deletar uma vaga apague todas as candidaturas (deve arquivar a vaga primeiro ou mover as pessoas)
-- Nota: Como o schema de recrutamento pode variar, usamos blocos seguros.

DO $$
BEGIN
    -- Se existir a tabela recruitment_applications
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recruitment_applications') THEN
        ALTER TABLE public.recruitment_applications 
        DROP CONSTRAINT IF EXISTS recruitment_applications_job_id_fkey,
        ADD CONSTRAINT recruitment_applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES recruitment_jobs(id) ON DELETE RESTRICT;
    END IF;

    -- Se existir a tabela performance_results
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_results') THEN
        ALTER TABLE public.performance_results 
        DROP CONSTRAINT IF EXISTS performance_results_evaluation_id_fkey,
        ADD CONSTRAINT performance_results_evaluation_id_fkey FOREIGN KEY (evaluation_id) REFERENCES performance_evaluations(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- 3. Adicionar Coluna deleted_at em Tabelas de Negócio Adicionais (Compliance 100%)
-- Já fizemos para Organizations/Units/Users. Agora estendemos para o fluxo de valor.

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN VALUES ('recruitment_jobs'), ('performance_cycles'), ('pdi_plans'), ('routine_items')
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t) AND 
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'deleted_at') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN deleted_at TIMESTAMPTZ', t);
        -- Também criamos o índice único parcial para nomes/slus se for o caso nestas tabelas futuramente
    END IF;
  END LOOP;
END $$;

COMMIT;
