-- Migração 057: Sistema de Gamificação (Badges)

-- 1. Tabela de Definição de Medalhas
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL, -- Nome do ícone Lucide ou Emoji
    color TEXT DEFAULT 'blue', -- blue, gold, silver, bronze, purple, etc.
    type TEXT DEFAULT 'achievement', -- achievement, certification, tenure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Conquistas dos Usuários
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
    org_id UUID REFERENCES organizations(id) NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    awarded_by UUID REFERENCES users(id), -- Quem concedeu a medalha (opcional, para peer recognition)
    comment TEXT,
    UNIQUE(user_id, badge_id) -- Impede medalhas duplicadas do mesmo tipo para o mesmo usuário
);

-- RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_org_isolation" ON badges
    USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "user_badges_org_isolation" ON user_badges
    USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

-- Comentários de Auditoria
COMMENT ON TABLE badges IS 'audit_enabled';
COMMENT ON TABLE user_badges IS 'audit_enabled';

-- Seed básico de medalhas para demonstração (opcional via script posterior ou manual)
-- Mas vamos deixar os metadados prontos.
