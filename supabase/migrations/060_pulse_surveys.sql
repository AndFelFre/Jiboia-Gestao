-- Tabela para definições de Pesquisas Pulse
CREATE TABLE IF NOT EXISTS pulse_surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    category TEXT NOT NULL, -- Ex: 'satisfacao', 'ferramentas', 'cultura'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para respostas das Pesquisas Pulse
CREATE TABLE IF NOT EXISTS pulse_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES pulse_surveys(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Opcional para anonimato
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE pulse_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_responses ENABLE ROW LEVEL SECURITY;

-- Políticas para Surveys
DROP POLICY IF EXISTS "Users can view active surveys" ON pulse_surveys;
CREATE POLICY "Users can view active surveys"
    ON pulse_surveys FOR SELECT
    USING (is_active = TRUE AND EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND org_id = pulse_surveys.org_id
    ));

-- Políticas para Responses
DROP POLICY IF EXISTS "Users can submit responses" ON pulse_responses;
CREATE POLICY "Users can submit responses"
    ON pulse_responses FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND org_id = pulse_responses.org_id
    ));

DROP POLICY IF EXISTS "Admins can view aggregated responses" ON pulse_responses;
CREATE POLICY "Admins can view aggregated responses"
    ON pulse_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND org_id = pulse_responses.org_id
            AND (role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'dho')))
        )
    );

-- Índices
CREATE INDEX IF NOT EXISTS idx_pulse_surveys_org ON pulse_surveys(org_id);
CREATE INDEX IF NOT EXISTS idx_pulse_responses_survey ON pulse_responses(survey_id);

COMMENT ON TABLE pulse_surveys IS 'Diferentes tipos de pesquisas rápidas para medir o clima.';
COMMENT ON TABLE pulse_responses IS 'Respostas individuais dos colaboradores às pesquisas pulse.';
