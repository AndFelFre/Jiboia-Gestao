-- Migration 081: Master Audit Architecture (JSONB Delta & Atomic Triggers)
-- Goal: Migrar para auditoria baseada em diferenciais (Delta) e remover dual-logging.

BEGIN;

-- 1. Função Auxiliar para Calcular Diferencial entre JSONBs (Delta)
-- Retorna um objeto contendo apenas as chaves que mudaram.
CREATE OR REPLACE FUNCTION public.jsonb_diff(old_val jsonb, new_val jsonb)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  key text;
  value jsonb;
BEGIN
  result := '{}'::jsonb;
  
  -- Se for INSERT (old null), retorna o new inteiro (ou apenas campos não nulos)
  IF old_val IS NULL THEN
    RETURN new_val;
  END IF;

  FOR key, value IN SELECT * FROM jsonb_each(new_val)
  LOOP
    IF NOT (old_val ? key) OR (old_val -> key) IS DISTINCT FROM value THEN
      -- Se a chave mudou ou é nova, adiciona ao resultado
      result := result || jsonb_build_object(key, value);
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Trigger de Auditoria Master (Delta + Context Fallback)
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    current_org_id UUID;
    v_old_values JSONB := NULL;
    v_new_values JSONB := NULL;
    v_changed_by UUID;
    v_context_user TEXT;
    v_audit_reason TEXT;
BEGIN
    -- 1. Resolver Identidade do Autor
    v_changed_by := auth.uid();
    IF v_changed_by IS NULL THEN
        -- Fallback para usuário do banco de dados (ex: postgres, service_role)
        v_context_user := current_setting('role', true);
    END IF;

    -- 2. Capturar Metadados de Sessão (Opcional, injetado via set_config no Next.js)
    v_audit_reason := current_setting('app.audit_reason', true);

    -- 3. Resolver Organization ID (Segurança Multi-tenant)
    -- Tenta pegar do registro atual (NEW em updates/inserts, OLD em deletes)
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            current_org_id := OLD.org_id;
        ELSE
            current_org_id := NEW.org_id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        current_org_id := NULL; -- Tabela pode não ter org_id explicitamente
    END;

    -- 4. Processar Delta (Economia de Storage)
    IF (TG_OP = 'DELETE') THEN
        v_old_values := to_jsonb(OLD);
        INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by, org_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', v_old_values, v_changed_by, current_org_id);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Calcula o que mudou
        v_new_values := jsonb_diff(to_jsonb(OLD), to_jsonb(NEW));
        
        -- Ignora se não houver mudança real de negócio
        IF v_new_values = '{}'::jsonb THEN
            RETURN NEW;
        END IF;

        -- Armazena o snapshot 'antes' apenas das chaves que mudaram (Opcional por consistência)
        -- Aqui salvamos o snapshot completo do OLD para garantir Rollback fácil, 
        -- mas apenas o NEW parcial (Delta) para análise de mudança.
        v_old_values := to_jsonb(OLD); -- Mantemos OLD completo para auditoria forense se necessário

        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by, org_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', v_old_values, v_new_values, v_changed_by, current_org_id);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        v_new_values := to_jsonb(NEW);
        INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by, org_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', v_new_values, v_changed_by, current_org_id);
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Comentário de Auditoria
COMMENT ON FUNCTION public.audit_trigger_func() IS 
'Arquitetura Master de Auditoria: Suporta Delta JSONB, Fallback de Contexto e é Multi-tenant Aware.';

COMMIT;
