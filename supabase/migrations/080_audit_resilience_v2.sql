-- Migration 080: Audit Resilience and Atomic Compliance
-- Goal: Fortalecer a auditoria com rede de segurança (triggers) e atomicidade.

BEGIN;

-- 1. Adicionar coluna org_id se não existir (Correção de paridade com logAudit)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='audit_logs' AND COLUMN_NAME='org_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN org_id UUID REFERENCES public.organizations(id);
    END IF;
END $$;

-- 2. Refinar Função de Auditoria Nativa (O "Trigger Fallback")
-- Captura mudanças manuais no Supabase Studio ou via scripts de service_role.
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    current_org_id UUID;
BEGIN
    -- Tenta capturar org_id do contexto ou da linha (se existir)
    BEGIN
        current_org_id := (NEW.org_id);
    EXCEPTION WHEN OTHERS THEN
        current_org_id := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by, org_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid(), current_org_id);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Só grava se houver mudança real (Evita log inútil por updates vazios)
        IF to_jsonb(OLD) = to_jsonb(NEW) THEN
            RETURN NEW;
        END IF;

        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by, org_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid(), current_org_id);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by, org_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid(), current_org_id);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Aplicar a Auditoria a TODAS as tabelas de negócio do DHO (Rede de Segurança Total)
-- Recrutamento
CREATE OR REPLACE TRIGGER audit_recruitment_jobs AFTER INSERT OR UPDATE OR DELETE ON public.recruitment_jobs FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE OR REPLACE TRIGGER audit_recruitment_candidates AFTER INSERT OR UPDATE OR DELETE ON public.recruitment_candidates FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Performance
CREATE OR REPLACE TRIGGER audit_performance_evaluations AFTER INSERT OR UPDATE OR DELETE ON public.performance_evaluations FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- PDI
CREATE OR REPLACE TRIGGER audit_pdi_plans AFTER INSERT OR UPDATE OR DELETE ON public.pdi_plans FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE OR REPLACE TRIGGER audit_pdi_items AFTER INSERT OR UPDATE OR DELETE ON public.pdi_items FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- 4. Preparação para Particionamento (Índices Eficientes)
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_date ON public.audit_logs (org_id, changed_at DESC);

COMMIT;

NOTIFY pgrst, 'reload schema';
