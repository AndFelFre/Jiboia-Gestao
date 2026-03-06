-- Tabela para armazenar as visões/painéis de relatórios criados pelos usuários (Self-service Analytics)

CREATE TABLE IF NOT EXISTS public.custom_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Guarda layout, blocks selecionados e posições
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices essenciais para consultas
CREATE INDEX IF NOT EXISTS idx_custom_reports_org_id ON public.custom_reports(org_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_owner_id ON public.custom_reports(owner_id);

-- Habilitar RLS
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;

-- Assegurar que os relatórios só existam/sejam visualizados dentro do Tenant correto
DROP POLICY IF EXISTS "Users can view reports from their own organization" ON public.custom_reports;
CREATE POLICY "Users can view reports from their own organization"
ON public.custom_reports FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.org_id = custom_reports.org_id
    )
);

-- Assegurar que os relatórios só existam/sejam inseridos dentro do Tenant por Admins e Lideres
DROP POLICY IF EXISTS "Admins and leaders can create reports for their organization" ON public.custom_reports;
CREATE POLICY "Admins and leaders can create reports for their organization"
ON public.custom_reports FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND u.org_id = custom_reports.org_id AND r.name IN ('admin', 'leader')
    )
);

-- Donos, Líderes e Admins locais podem atualizar
DROP POLICY IF EXISTS "Users can update their own reports or admins can update any in org" ON public.custom_reports;
CREATE POLICY "Users can update their own reports or admins can update any in org"
ON public.custom_reports FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND u.org_id = custom_reports.org_id 
        AND (custom_reports.owner_id = u.id OR r.name = 'admin')
    )
);

-- Donos, Líderes e Admins locais podem deletar
DROP POLICY IF EXISTS "Users can delete their own reports or admins can delete any in org" ON public.custom_reports;
CREATE POLICY "Users can delete their own reports or admins can delete any in org"
ON public.custom_reports FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND u.org_id = custom_reports.org_id 
        AND (custom_reports.owner_id = u.id OR r.name = 'admin')
    )
);

-- Criar função local caso ela já não exista na base consolidada
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_custom_reports_updated_at ON public.custom_reports;
CREATE TRIGGER set_custom_reports_updated_at
BEFORE UPDATE ON public.custom_reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
