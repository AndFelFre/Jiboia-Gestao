-- Tabela para armazenar Kudos (elogios entre pares)
CREATE TABLE IF NOT EXISTS kudos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    tags TEXT[], -- Ex: ['colaboração', 'liderança']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE kudos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Todos da mesma organização podem ver os Kudos
DROP POLICY IF EXISTS "Users can view kudos in their organization" ON kudos;
CREATE POLICY "Users can view kudos in their organization"
    ON kudos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND org_id = kudos.org_id
        )
    );

-- Somente o remetente pode enviar Kudos (automático pelo auth.uid())
DROP POLICY IF EXISTS "Users can send kudos" ON kudos;
CREATE POLICY "Users can send kudos"
    ON kudos FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Somente o remetente pode deletar seu próprio Kudo
DROP POLICY IF EXISTS "Users can delete their own kudos" ON kudos;
CREATE POLICY "Users can delete their own kudos"
    ON kudos FOR DELETE
    USING (auth.uid() = sender_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_kudos_org_id ON kudos(org_id);
CREATE INDEX IF NOT EXISTS idx_kudos_receiver_id ON kudos(receiver_id);
CREATE INDEX IF NOT EXISTS idx_kudos_created_at ON kudos(created_at DESC);

COMMENT ON TABLE kudos IS 'Armazena elogios e reconhecimento horizontal entre colaboradores.';
