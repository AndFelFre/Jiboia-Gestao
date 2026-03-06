-- Migração 065: Políticas de Segurança & MFA
-- Adiciona suporte para exigência de MFA e configurações de complexidade de senha por organização.

-- 1. Adicionar colunas na tabela organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS mfa_enforced BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{
  "password_policy": {
    "min_length": 8,
    "require_uppercase": true,
    "require_numbers": true,
    "require_symbols": false
  }
}'::jsonb;

-- 2. Comentários para documentação
COMMENT ON COLUMN public.organizations.mfa_enforced IS 'Indica se a MFA é obrigatória para todos os usuários da organização';
COMMENT ON COLUMN public.organizations.security_settings IS 'Configurações de políticas de senha e outras regras de segurança da organização';

-- 3. Logs de auditoria para as novas colunas já estão cobertos pelos triggers genéricos da organizations.
