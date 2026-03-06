-- Migration: 056_onboarding_module.sql
-- Descrição: Tabelas para gestão de Onboarding digital

-- 1. Templates de Onboarding (ex: "Onboarding Geral", "Onboarding Dev")
CREATE TABLE IF NOT EXISTS onboarding_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Itens do Checklist (ex: "Assinar contrato", "Receber notebook")
CREATE TABLE IF NOT EXISTS onboarding_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sequence INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Progresso do Usuário
CREATE TABLE IF NOT EXISTS user_onboarding_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES onboarding_templates(id),
    item_id UUID NOT NULL REFERENCES onboarding_items(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, completed
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id), -- Quem marcou como feito (colaborador ou RH)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, item_id)
);

-- RLS
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso simplificadas (seguindo o padrão do projeto)
CREATE POLICY "Template Org Access" ON onboarding_templates
    FOR ALL USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Items Template Access" ON onboarding_items
    FOR ALL USING (template_id IN (SELECT id FROM onboarding_templates));

CREATE POLICY "Progress Org Access" ON user_onboarding_progress
    FOR ALL USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

-- Triggers de Auditoria (se existir o sistema de triggers por nome)
-- DROP TRIGGER IF EXISTS audit_onboarding_templates ON onboarding_templates;
-- CREATE TRIGGER audit_onboarding_templates AFTER INSERT OR UPDATE OR DELETE ON onboarding_templates FOR EACH ROW EXECUTE FUNCTION public.log_changes();
