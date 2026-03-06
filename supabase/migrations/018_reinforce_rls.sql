-- Migration: Reforço de Segurança (RLS) e Multi-tenancy
-- Fase 0: Fundação e Blindagem

DO $$
BEGIN
  RAISE NOTICE 'Iniciando reforço de segurança RLS...';

  -- 1. UTILS: FUNÇÃO PARA RODAR SQL APENAS SE A TABELA EXISTIR
  -- Fazemos isso via EXECUTE para evitar erros de parse se a tabela não existir
  
  -- ORGANIZATIONS
  IF to_regclass('organizations') IS NOT NULL THEN
    ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS temp_allow_all ON organizations;
    DROP POLICY IF EXISTS org_select ON organizations;
    DROP POLICY IF EXISTS org_admin_all ON organizations;
    DROP POLICY IF EXISTS org_isolation ON organizations;
    CREATE POLICY org_isolation ON organizations FOR SELECT TO authenticated
    USING (id IN (SELECT org_id FROM users WHERE id = auth.uid()));
  END IF;

  -- UNITS
  IF to_regclass('units') IS NOT NULL THEN
    ALTER TABLE units ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS temp_allow_all ON units;
    DROP POLICY IF EXISTS units_select ON units;
    DROP POLICY IF EXISTS units_admin_all ON units;
    DROP POLICY IF EXISTS units_isolation ON units;
    CREATE POLICY units_isolation ON units FOR ALL TO authenticated
    USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
  END IF;

  -- USERS
  IF to_regclass('users') IS NOT NULL THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS temp_allow_all ON users;
    DROP POLICY IF EXISTS users_select_own ON users;
    DROP POLICY IF EXISTS users_select_team ON users;
    DROP POLICY IF EXISTS users_admin_all ON users;
    DROP POLICY IF EXISTS users_isolation ON users;
    CREATE POLICY users_isolation ON users FOR SELECT TO authenticated
    USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
  END IF;

  -- POSITIONS, LEVELS, TRACKS
  IF to_regclass('positions') IS NOT NULL THEN
    ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS positions_isolation ON positions;
    CREATE POLICY positions_isolation ON positions FOR ALL TO authenticated
    USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
  END IF;

  IF to_regclass('levels') IS NOT NULL THEN
    ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS levels_isolation ON levels;
    CREATE POLICY levels_isolation ON levels FOR ALL TO authenticated
    USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
  END IF;

  IF to_regclass('tracks') IS NOT NULL THEN
    ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tracks_isolation ON tracks;
    CREATE POLICY tracks_isolation ON tracks FOR ALL TO authenticated
    USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
  END IF;

  -- RECRUITMENT (Módulo Opcional)
  IF to_regclass('jobs') IS NOT NULL THEN
    ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS temp_jobs ON jobs;
    DROP POLICY IF EXISTS jobs_isolation ON jobs;
    CREATE POLICY jobs_isolation ON jobs FOR ALL TO authenticated
    USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
  END IF;

  IF to_regclass('candidates') IS NOT NULL THEN
    ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS temp_candidates ON candidates;
    DROP POLICY IF EXISTS candidates_isolation ON candidates;
    CREATE POLICY candidates_isolation ON candidates FOR ALL TO authenticated
    USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
  END IF;

  IF to_regclass('interviews') IS NOT NULL THEN
    ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS temp_interviews ON interviews;
  END IF;

  -- AUDIT LOGS
  IF to_regclass('audit_logs') IS NOT NULL THEN
    ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    
    -- Garantir org_id na tabela para RLS eficiente
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='audit_logs' AND COLUMN_NAME='org_id') THEN
      ALTER TABLE audit_logs ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;

    DROP POLICY IF EXISTS audit_isolation ON audit_logs;
    CREATE POLICY audit_isolation ON audit_logs FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.id = auth.uid() AND r.name = 'admin' AND u.org_id = audit_logs.org_id
      )
    );
  END IF;

  RAISE NOTICE '✓ RLS Reforçado e Multi-tenancy blindado com sucesso.';
END $$;
