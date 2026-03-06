-- ==================================================
-- MIGRATION COMPLETA: MOTOR DE KPIS + FUNIL + BÔNUS
-- (Unificação das Migrações 066 e 067)
-- ==================================================

-- 1. MOTOR DE KPIS (Tabelas Base)
CREATE TABLE IF NOT EXISTS public.kpi_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_slug TEXT NOT NULL,
    data_type TEXT NOT NULL CHECK (data_type IN ('number', 'percentage', 'currency', 'time')),
    is_reversed BOOLEAN DEFAULT false,
    min_green_threshold NUMERIC(5,2) DEFAULT 100.0,
    min_yellow_threshold NUMERIC(5,2) DEFAULT 80.0,
    cap_percentage NUMERIC(5,2) DEFAULT 150.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, key_slug)
);

CREATE TABLE IF NOT EXISTS public.kpi_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    kpi_id UUID NOT NULL REFERENCES public.kpi_definitions(id) ON DELETE CASCADE,
    weight NUMERIC(5,2) DEFAULT 1.0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    target_value NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, kpi_id, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS public.kpi_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.kpi_targets(id) ON DELETE CASCADE,
    actual_value NUMERIC(15,2) NOT NULL DEFAULT 0,
    achievement_percentage NUMERIC(5,2) DEFAULT 0,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(target_id)
);

-- 2. FUNIL DE VENDAS / FORECAST DIÁRIO
CREATE TABLE IF NOT EXISTS public.funnel_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sequence INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS public.funnel_inputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES public.funnel_activities(id) ON DELETE CASCADE,
    input_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, activity_id, input_date)
);

-- 3. CAMADA DE BÔNUS E TEMPLATES (Módulo Financeiro)
CREATE TABLE IF NOT EXISTS public.kpi_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS public.kpi_template_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES public.kpi_templates(id) ON DELETE CASCADE,
    kpi_id UUID NOT NULL REFERENCES public.kpi_definitions(id) ON DELETE CASCADE,
    default_weight NUMERIC(5,2) DEFAULT 1.0,
    UNIQUE(template_id, kpi_id)
);

CREATE TABLE IF NOT EXISTS public.bonus_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS public.user_bonus_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    cycle_id UUID NOT NULL REFERENCES public.bonus_cycles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    base_salary NUMERIC(15,2) NOT NULL DEFAULT 0, 
    target_bonus_percentage NUMERIC(5,2) NOT NULL DEFAULT 0, 
    final_achievement_percentage NUMERIC(5,2) DEFAULT 0, 
    calculated_bonus_value NUMERIC(15,2) DEFAULT 0, 
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cycle_id, user_id)
);

-- 4. Extensão de kpi_targets para Ciclo
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'kpi_targets' AND COLUMN_NAME = 'cycle_id') THEN
        ALTER TABLE public.kpi_targets ADD COLUMN cycle_id UUID REFERENCES public.bonus_cycles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. RLS - ROW LEVEL SECURITY (Apenas se ainda não habilitado)
ALTER TABLE public.kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bonus_summaries ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS (SELECT / ALL)
-- (Usando DROP para evitar erro de objeto já existente se rodar 2x)
DROP POLICY IF EXISTS kpi_defs_view ON public.kpi_definitions;
CREATE POLICY kpi_defs_view ON public.kpi_definitions FOR SELECT TO authenticated USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS kpi_defs_manage ON public.kpi_definitions;
CREATE POLICY kpi_defs_manage ON public.kpi_definitions FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND u.org_id = kpi_definitions.org_id AND r.name IN ('admin', 'leader'))
);

-- KPI Targets
DROP POLICY IF EXISTS kpi_targets_employee_select ON public.kpi_targets;
CREATE POLICY kpi_targets_employee_select ON public.kpi_targets FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS kpi_targets_admin_all ON public.kpi_targets;
CREATE POLICY kpi_targets_admin_all ON public.kpi_targets FOR ALL TO authenticated 
USING (
    EXISTS (SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND u.org_id = kpi_targets.org_id AND r.name IN ('admin', 'leader'))
)
WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = user_id AND u.org_id = org_id)
);

-- KPI Results
DROP POLICY IF EXISTS kpi_results_employee_select ON public.kpi_results;
CREATE POLICY kpi_results_employee_select ON public.kpi_results FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM kpi_targets t WHERE t.id = target_id AND t.user_id = auth.uid()));

DROP POLICY IF EXISTS kpi_results_employee_update ON public.kpi_results;
CREATE POLICY kpi_results_employee_update ON public.kpi_results FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM kpi_targets t WHERE t.id = target_id AND t.user_id = auth.uid()));

DROP POLICY IF EXISTS kpi_results_admin_all ON public.kpi_results;
CREATE POLICY kpi_results_admin_all ON public.kpi_results FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND u.org_id = kpi_results.org_id AND r.name IN ('admin', 'leader'))
);

-- Funnel Activities
DROP POLICY IF EXISTS funnel_act_view ON public.funnel_activities;
CREATE POLICY funnel_act_view ON public.funnel_activities FOR SELECT TO authenticated USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS funnel_act_manage ON public.funnel_activities;
CREATE POLICY funnel_act_manage ON public.funnel_activities FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND u.org_id = funnel_activities.org_id AND r.name IN ('admin', 'leader'))
);

-- Funnel Inputs
DROP POLICY IF EXISTS funnel_inp_employee_all ON public.funnel_inputs;
CREATE POLICY funnel_inp_employee_all ON public.funnel_inputs FOR ALL TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND org_id = (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS funnel_inp_admin_all ON public.funnel_inputs;
CREATE POLICY funnel_inp_admin_all ON public.funnel_inputs FOR ALL TO authenticated 
USING (
    EXISTS (SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND u.org_id = funnel_inputs.org_id AND r.name IN ('admin', 'leader'))
)
WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = user_id AND u.org_id = org_id)
);

-- Bônus e Templates
DROP POLICY IF EXISTS user_bonus_summaries_view_own ON public.user_bonus_summaries;
CREATE POLICY user_bonus_summaries_view_own ON public.user_bonus_summaries FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_bonus_summaries_manage_admin ON public.user_bonus_summaries;
CREATE POLICY user_bonus_summaries_manage_admin ON public.user_bonus_summaries FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = auth.uid() AND u.org_id = user_bonus_summaries.org_id AND r.name IN ('admin', 'leader')));

-- 7. TRIGGERS
-- (Assume-se que update_updated_at_column() já existe)
DO $$ BEGIN
    CREATE TRIGGER update_kpi_definitions_tz BEFORE UPDATE ON public.kpi_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_kpi_targets_tz BEFORE UPDATE ON public.kpi_targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_bonus_cycles_tz BEFORE UPDATE ON public.bonus_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 8. RELOAD
NOTIFY pgrst, 'reload schema';
