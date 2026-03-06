-- Tabela para configurar Webhooks (integrações externas)
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    event_type TEXT NOT NULL, -- Ex: 'kudo.created', 'badge.awarded'
    secret TEXT, -- Para assinatura de segurança
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Somente admins podem gerenciar webhooks
DROP POLICY IF EXISTS "Admins can manage webhooks" ON webhooks;
CREATE POLICY "Admins can manage webhooks"
    ON webhooks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND org_id = webhooks.org_id
            AND (role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'dho')))
        )
    );

-- Índice para busca rápida de webhooks ativos por organização e evento
CREATE INDEX IF NOT EXISTS idx_webhooks_dispatch ON webhooks(org_id, event_type, is_active);

COMMENT ON TABLE webhooks IS 'Configurações de integração via Webhooks para eventos do sistema.';
