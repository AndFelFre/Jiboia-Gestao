-- Migration: Módulo de Recrutamento
-- Tabelas: jobs, candidates, interviews

-- ============================================
-- TABELAS DE RECRUTAMENTO
-- ============================================

-- Vagas
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  responsibilities TEXT[],
  location TEXT,
  employment_type TEXT CHECK (employment_type IN ('clt', 'pj', 'intern', 'freelancer')),
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  positions_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'paused', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  sla_days INTEGER DEFAULT 30,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Candidatos
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  resume_url TEXT,
  source TEXT,
  stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'screening', 'interview_1', 'interview_2', 'technical', 'cultural', 'offer', 'hired', 'rejected')),
  stage_changed_at TIMESTAMPTZ DEFAULT NOW(),
  fit_score DECIMAL(3,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entrevistas STAR + Fit Cultural
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('star', 'technical', 'cultural', 'final')),
  
  -- STAR Assessment
  star_situation TEXT,
  star_task TEXT,
  star_action TEXT,
  star_result TEXT,
  
  -- Fit Cultural Scores (1-4 ou C-A)
  fit_integrity INTEGER CHECK (fit_integrity BETWEEN 1 AND 4),
  fit_focus INTEGER CHECK (fit_focus BETWEEN 1 AND 4),
  fit_learning INTEGER CHECK (fit_learning BETWEEN 1 AND 4),
  fit_challenge INTEGER CHECK (fit_challenge BETWEEN 1 AND 4),
  fit_communication INTEGER CHECK (fit_communication BETWEEN 1 AND 4),
  fit_service INTEGER CHECK (fit_service BETWEEN 1 AND 4),
  fit_persistence INTEGER CHECK (fit_persistence BETWEEN 1 AND 4),
  
  final_score DECIMAL(3,2),
  justification TEXT NOT NULL,
  recommendation TEXT CHECK (recommendation IN ('strong_no', 'no', 'yes', 'strong_yes')),
  next_steps TEXT,
  
  conducted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de mudanças de etapa
CREATE TABLE stage_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  from_stage TEXT NOT NULL,
  to_stage TEXT NOT NULL,
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_transitions ENABLE ROW LEVEL SECURITY;

-- Políticas temporárias (substituir pelas definitivas depois)
CREATE POLICY temp_jobs ON jobs FOR ALL TO authenticated USING (true);
CREATE POLICY temp_candidates ON candidates FOR ALL TO authenticated USING (true);
CREATE POLICY temp_interviews ON interviews FOR ALL TO authenticated USING (true);
CREATE POLICY temp_transitions ON stage_transitions FOR ALL TO authenticated USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para registrar mudanças de etapa
CREATE OR REPLACE FUNCTION log_stage_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO stage_transitions (candidate_id, from_stage, to_stage, changed_at)
    VALUES (NEW.id, OLD.stage, NEW.stage, NOW());
    NEW.stage_changed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER candidate_stage_change
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION log_stage_transition();

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_jobs_org_id ON jobs(org_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_candidates_job_id ON candidates(job_id);
CREATE INDEX idx_candidates_stage ON candidates(stage);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX idx_stage_transitions_candidate ON stage_transitions(candidate_id);
