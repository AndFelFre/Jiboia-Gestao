-- Migração: Adicionar suporte a domínios customizados (Multi-tenancy)

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;

-- Criar índice para buscas rápidas no middleware
CREATE INDEX IF NOT EXISTS idx_organizations_custom_domain ON public.organizations(custom_domain);
