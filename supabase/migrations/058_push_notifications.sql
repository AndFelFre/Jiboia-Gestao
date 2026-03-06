-- Tabela para armazenar assinaturas de Notificações Push (Web Push API)
CREATE TABLE IF NOT EXISTS user_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_json JSONB NOT NULL,
    device_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE user_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON user_push_subscriptions;
CREATE POLICY "Users can manage their own subscriptions"
    ON user_push_subscriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view org subscriptions" ON user_push_subscriptions;
CREATE POLICY "Admins can view org subscriptions"
    ON user_push_subscriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND org_id = user_push_subscriptions.org_id
            AND (role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'dho')))
        )
    );

-- Gatilho de Auditoria
COMMENT ON TABLE user_push_subscriptions IS 'Armazena tokens de Web Push para notificações PWA.';
