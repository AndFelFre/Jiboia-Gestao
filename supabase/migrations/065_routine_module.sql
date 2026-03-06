-- Migration 065: Routine and Funnel Module
-- Tabelas para configurar a "Barra Mínima" e coletar o preenchimento diário do Funil

-- ============================================
-- 1. routine_definitions (Configuração Admin)
-- ============================================
CREATE TABLE IF NOT EXISTS public.routine_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_value NUMERIC(10, 2) NOT NULL DEFAULT 0, -- A meta a ser batida (Ex: 10 ligacoes)
    frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. routine_inputs (Preenchimento pelo Colaborador)
-- ============================================
CREATE TABLE IF NOT EXISTS public.routine_inputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    routine_definition_id UUID NOT NULL REFERENCES public.routine_definitions(id) ON DELETE CASCADE,
    input_date DATE NOT NULL DEFAULT CURRENT_DATE,
    achieved_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, routine_definition_id, input_date) -- Um input por métrica por dia.
);

-- ============================================
-- RLS E POLÍTICAS DE SEGURANÇA
-- ============================================
ALTER TABLE public.routine_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_inputs ENABLE ROW LEVEL SECURITY;

-- Definitions: Todos veem, só Admin/Líder altera.
DROP POLICY IF EXISTS routine_def_view ON public.routine_definitions;
CREATE POLICY routine_def_view ON public.routine_definitions
    FOR SELECT TO authenticated
    USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS routine_def_manage ON public.routine_definitions;
CREATE POLICY routine_def_manage ON public.routine_definitions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() AND u.org_id = routine_definitions.org_id 
            AND r.name IN ('admin', 'leader')
        )
    );

-- Inputs: O dono cria/vê os seus. Líder/Admin veem de toda a org.
DROP POLICY IF EXISTS routine_input_owner ON public.routine_inputs;
CREATE POLICY routine_input_owner ON public.routine_inputs
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS routine_input_leader_view ON public.routine_inputs;
CREATE POLICY routine_input_leader_view ON public.routine_inputs
    FOR SELECT TO authenticated
    USING (
         EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() AND u.org_id = routine_inputs.org_id 
            AND r.name IN ('admin', 'leader')
        )
    );

-- Triggers de timestamp
DROP TRIGGER IF EXISTS set_routine_def_timestamp ON public.routine_definitions;
CREATE TRIGGER set_routine_def_timestamp BEFORE UPDATE ON public.routine_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS set_routine_inp_timestamp ON public.routine_inputs;
CREATE TRIGGER set_routine_inp_timestamp BEFORE UPDATE ON public.routine_inputs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Notificar a API para atualizar Tipagem
NOTIFY pgrst, 'reload schema';
