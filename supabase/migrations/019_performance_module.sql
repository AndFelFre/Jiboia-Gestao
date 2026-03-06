-- Migration: Gestão de Performance
-- Tabelas: skills, position_skills, evaluations, evaluation_scores

-- ============================================
-- TABELAS DE COMPETÊNCIAS
-- ============================================

-- Catálogo de Competências
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hard_skill', 'soft_skill')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requisitos de Competência por Cargo
CREATE TABLE IF NOT EXISTS position_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  required_level INTEGER NOT NULL CHECK (required_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(position_id, skill_id)
);

-- ============================================
-- TABELAS DE AVALIAÇÃO
-- ============================================

-- Ciclos de Avaliação
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'completed', 'canceled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notas por Competência
CREATE TABLE IF NOT EXISTS evaluation_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evaluation_id, skill_id)
);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_scores ENABLE ROW LEVEL SECURITY;

-- Políticas para skills
CREATE POLICY skills_isolation ON skills
  FOR ALL TO authenticated
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

-- Políticas para position_skills
CREATE POLICY position_skills_isolation ON position_skills
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM positions p
      WHERE p.id = position_id
      AND p.org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    )
  );

-- Políticas para evaluations
CREATE POLICY evaluations_isolation ON evaluations
  FOR ALL TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    AND (
      user_id = auth.uid() OR 
      evaluator_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.id = auth.uid() AND r.name = 'admin'
      )
    )
  );

-- Políticas para evaluation_scores
CREATE POLICY scores_isolation ON evaluation_scores
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluations e
      WHERE e.id = evaluation_id
      AND (
        e.user_id = auth.uid() OR 
        e.evaluator_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users u 
          JOIN roles r ON u.role_id = r.id 
          WHERE u.id = auth.uid() AND r.name = 'admin'
        )
      )
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_skills_org ON skills(org_id);
CREATE INDEX idx_evaluations_org ON evaluations(org_id);
CREATE INDEX idx_evaluations_user ON evaluations(user_id);
CREATE INDEX idx_evaluations_evaluator ON evaluations(evaluator_id);
CREATE INDEX idx_scores_evaluation ON evaluation_scores(evaluation_id);
