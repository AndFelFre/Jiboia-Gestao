-- 1. Enum para Tipos de Planos PDI
DO $$
BEGIN
    CREATE TYPE pdi_plan_type AS ENUM ('development', 'leadership_rites');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Adicionar campos em pdi_plans
ALTER TABLE public.pdi_plans 
ADD COLUMN IF NOT EXISTS plan_type pdi_plan_type NOT NULL DEFAULT 'development',
ADD COLUMN IF NOT EXISTS reference_year SMALLINT,
ADD COLUMN IF NOT EXISTS leader_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- 3. Regra: leadership_rites exige reference_year
ALTER TABLE public.pdi_plans DROP CONSTRAINT IF EXISTS check_reference_year_required;
ALTER TABLE public.pdi_plans
ADD CONSTRAINT check_reference_year_required
CHECK (
    plan_type <> 'leadership_rites'
    OR reference_year IS NOT NULL
);

-- 4. Regra: leadership_rites exige líder responsável
ALTER TABLE public.pdi_plans DROP CONSTRAINT IF EXISTS check_leader_id_required;
ALTER TABLE public.pdi_plans
ADD CONSTRAINT check_leader_id_required
CHECK (
    plan_type <> 'leadership_rites'
    OR leader_id IS NOT NULL
);

-- 5. Unicidade: um plano de ritos por colaborador por ano
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_rites_plan_per_year 
ON public.pdi_plans (user_id, reference_year) 
WHERE plan_type = 'leadership_rites';

-- 6. Índice de lookup dos planos de rito
CREATE INDEX IF NOT EXISTS idx_pdi_plans_rites_lookup
ON public.pdi_plans (user_id, plan_type, reference_year, leader_id);

-- 7. Extensão de categorias de itens
ALTER TYPE pdi_item_category ADD VALUE IF NOT EXISTS 'leadership_rite';

-- 8. Enum para Tipos de Rito
DO $$
BEGIN
    CREATE TYPE dho_rite_type AS ENUM ('one_on_one', 'feedback', 'checkpoint');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 9. Adicionar colunas em pdi_items
ALTER TABLE public.pdi_items 
ADD COLUMN IF NOT EXISTS rite_type dho_rite_type,
ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- 10. Regra: rito exige rite_type
-- Nota: Usamos cast para text para evitar erro 55P04 (Enum value must be committed)
ALTER TABLE public.pdi_items DROP CONSTRAINT IF EXISTS check_rite_type_required;
ALTER TABLE public.pdi_items 
ADD CONSTRAINT check_rite_type_required 
CHECK (
    category::text <> 'leadership_rite' 
    OR rite_type IS NOT NULL
);

-- 11. Índice de performance para itens de rito
CREATE INDEX IF NOT EXISTS idx_pdi_items_rites_composite 
ON public.pdi_items (plan_id, category, rite_type, status, deadline);

NOTIFY pgrst, 'reload schema';
