-- Migration: Privacy by Design Core Implementation
-- 1. Refactor Audit Trigger to mask sensitive columns
-- 2. Segregate sensitive termination data
-- 3. Enhance K-Anonymity in Analytics

-- ============================================
-- 1. MASCARAMENTO DE AUDITORIA (BLACKBOX LOGGING)
-- ============================================

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  -- Blacklist de colunas sensíveis que NUNCA devem estar legíveis no log
  v_blacklist TEXT[] := ARRAY['salary_min', 'salary_max', 'termination_reason', 'encrypted_password', 'cpf', 'rg', 'phone'];
  v_col TEXT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_old_data := to_jsonb(OLD);
    FOREACH v_col IN ARRAY v_blacklist LOOP
      IF v_old_data ? v_col THEN
        v_old_data := v_old_data || jsonb_build_object(v_col, '[SENSITIVE_DATA_HIDDEN]');
      END IF;
    END LOOP;
    
    INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', v_old_data, auth.uid());
    RETURN OLD;
    
  ELSIF (TG_OP = 'UPDATE') THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    
    FOREACH v_col IN ARRAY v_blacklist LOOP
      IF v_old_data ? v_col THEN
        v_old_data := v_old_data || jsonb_build_object(v_col, '[SENSITIVE_DATA_HIDDEN]');
      END IF;
      IF v_new_data ? v_col THEN
        v_new_data := v_new_data || jsonb_build_object(v_col, '[SENSITIVE_DATA_HIDDEN]');
      END IF;
    END LOOP;

    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', v_old_data, v_new_data, auth.uid());
    RETURN NEW;
    
  ELSIF (TG_OP = 'INSERT') THEN
    v_new_data := to_jsonb(NEW);
    FOREACH v_col IN ARRAY v_blacklist LOOP
      IF v_new_data ? v_col THEN
        v_new_data := v_new_data || jsonb_build_object(v_col, '[SENSITIVE_DATA_HIDDEN]');
      END IF;
    END LOOP;

    INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', v_new_data, auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. SEGREGAÇÃO DE DADOS SENSÍVEIS (RH ISOLATION)
-- ============================================

CREATE TABLE IF NOT EXISTS user_sensitive_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  termination_reason TEXT,
  termination_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Migrar dados existentes de users para a nova tabela (se houver dados)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='termination_reason') THEN
    INSERT INTO user_sensitive_records (user_id, org_id, termination_reason)
    SELECT id, org_id, termination_reason FROM users WHERE termination_reason IS NOT NULL
    ON CONFLICT (user_id) DO NOTHING;
    
    ALTER TABLE users DROP COLUMN IF EXISTS termination_reason;
  END IF;
END $$;

-- RLS restrito para a tabela sensível
ALTER TABLE user_sensitive_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY sensitive_admin_access ON user_sensitive_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() 
      AND (r.name = 'admin' OR r.permissions->>'dpo' = 'true')
    )
  );

-- ============================================
-- 3. K-ANONYMITY (THRESHOLD N < 3) - REFINADO
-- ============================================

CREATE OR REPLACE VIEW mv_performance_org_safe AS
SELECT 
    org_id,
    unit_id,
    period,
    CASE WHEN count_evaluations >= 3 THEN avg_resilience ELSE NULL END as avg_resilience,
    CASE WHEN count_evaluations >= 3 THEN avg_utility ELSE NULL END as avg_utility,
    CASE WHEN count_evaluations >= 3 THEN avg_ambition ELSE NULL END as avg_ambition,
    CASE WHEN count_evaluations >= 3 THEN smart_conversion_rate ELSE NULL END as smart_conversion_rate,
    avg_cohort_rampup_progress, -- Onboarding consolidado costuma ser público/agregado
    count_evaluations as sample_size
FROM (
    -- Subquery original da View de performance (Fase 9)
    SELECT 
        org_id,
        unit_id,
        period,
        AVG(resilience_score) as avg_resilience,
        AVG(utility_score) as avg_utility,
        AVG(ambition_score) as avg_ambition,
        AVG(smart_conversion) as smart_conversion_rate,
        AVG(rampup_progress) as avg_cohort_rampup_progress,
        COUNT(*) as count_evaluations
    FROM performance_evaluations -- Exemplo: Tabela de origem
    GROUP BY org_id, unit_id, period
) raw_stats;
