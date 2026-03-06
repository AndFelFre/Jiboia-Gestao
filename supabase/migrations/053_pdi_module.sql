-- migration 053: PDI Module Implementation
-- Cria as tabelas para suportar o Plano de Desenvolvimento Individual.

CREATE TYPE pdi_item_status AS ENUM ('not_started', 'in_progress', 'completed', 'cancelled');
CREATE TYPE pdi_item_category AS ENUM ('course', 'mentoring', 'reading', 'project', 'other');

-- Plano de Desenvolvimento Individual (Mestre)
CREATE TABLE public.pdi_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, status) -- Apenas um plano ativo por vez
);

-- Itens de ação do PDI
CREATE TABLE public.pdi_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES public.pdi_plans(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL, -- Opcional: liga a uma competência específica
    title TEXT NOT NULL,
    description TEXT,
    category pdi_item_category NOT NULL DEFAULT 'other',
    status pdi_item_status NOT NULL DEFAULT 'not_started',
    deadline DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.pdi_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdi_items ENABLE ROW LEVEL SECURITY;

-- Políticas para pdi_plans
CREATE POLICY pdi_plans_owner ON public.pdi_plans
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY pdi_plans_leader ON public.pdi_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'leader'))
            AND users.org_id = pdi_plans.org_id
        )
    );

-- Políticas para pdi_items
CREATE POLICY pdi_items_owner ON public.pdi_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.pdi_plans 
            WHERE pdi_plans.id = pdi_items.plan_id 
            AND pdi_plans.user_id = auth.uid()
        )
    );

CREATE POLICY pdi_items_leader ON public.pdi_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pdi_plans
            JOIN public.users ON pdi_plans.org_id = users.org_id
            WHERE pdi_plans.id = pdi_items.plan_id
            AND users.id = auth.uid()
            AND users.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'leader'))
        )
    );

-- Trigger para updated_at
CREATE TRIGGER set_pdi_plans_updated_at BEFORE UPDATE ON public.pdi_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_pdi_items_updated_at BEFORE UPDATE ON public.pdi_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

NOTIFY pgrst, 'reload schema';
