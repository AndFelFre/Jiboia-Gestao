-- Migration: 074_refactor_recruitment_precision.sql
-- Goal: Ensure numerical precision for recruitment scores and audit readiness

-- 1. Alterar final_score em interviews para numeric(5,2) para garantir a precisão de 0.1 + 0.2
ALTER TABLE interviews 
ALTER COLUMN final_score TYPE numeric(5,2);

-- 2. Alterar fit_score em candidates para numeric(5,2)
ALTER TABLE candidates
ALTER COLUMN fit_score TYPE numeric(5,2);

-- 3. Criar tabela de configurações de recrutamento (mencionada no serviço de candidates)
CREATE TABLE IF NOT EXISTS recruitment_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    workflow_type text DEFAULT 'standard' CHECK (workflow_type IN ('standard', 'fast', 'strict')),
    flow_rules jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(org_id)
);

-- 4. Inserir configurações padrão para organizações existentes
INSERT INTO recruitment_settings (org_id, workflow_type)
SELECT id, 'standard' FROM organizations
ON CONFLICT (org_id) DO NOTHING;

-- 5. Comentários para documentação
COMMENT ON TABLE recruitment_settings IS 'Armazena regras de transição da Máquina de Estados do fluxograma de recrutamento.';
COMMENT ON COLUMN interviews.final_score IS 'Média ponderada dos 7 pilares comportamentais calculada no servidor.';
