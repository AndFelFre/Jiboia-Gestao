-- migration 029: Final RLS Stability (Breaking Recursion)
-- Este script resolve a recursão infinita de uma vez por todas.

-- 1. FUNÇÕES AUXILIARES (SECURITY DEFINER bypassa RLS para evitar recursão)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role_name TEXT;
BEGIN
  SELECT r.name INTO v_role_name
  FROM public.users u
  JOIN public.roles r ON u.role_id = r.id
  WHERE u.id = user_id;
  RETURN v_role_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_org(user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT org_id INTO v_org_id
  FROM public.users
  WHERE id = user_id;
  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. LIMPEZA DE POLÍTICAS EXISTENTES
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename) || ';';
    END LOOP;
END $$;

-- 3. NOVAS POLÍTICAS LINEARES (Sem Recursão)

-- ROLES (Leitura para todos autenticados)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roles_read ON public.roles FOR SELECT TO authenticated USING (true);

-- USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Usuário vê a si mesmo
CREATE POLICY users_self_view ON public.users FOR SELECT TO authenticated USING (id = auth.uid());
-- Admin vê todos
CREATE POLICY users_admin_all ON public.users FOR ALL TO authenticated 
USING (public.get_user_role(auth.uid()) = 'admin');

-- ORGANIZATIONS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY organizations_isolation ON public.organizations FOR SELECT TO authenticated 
USING (id = public.get_user_org(auth.uid()));
CREATE POLICY organizations_admin_all ON public.organizations FOR ALL TO authenticated 
USING (public.get_user_role(auth.uid()) = 'admin');

-- UNITS
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY units_isolation ON public.units FOR ALL TO authenticated 
USING (org_id = public.get_user_org(auth.uid()));

-- POSITIONS
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY positions_isolation ON public.positions FOR ALL TO authenticated 
USING (org_id = public.get_user_org(auth.uid()));

-- MÓDULO PERFORMANCE (Skills, Evaluations)
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY skills_isolation ON public.skills FOR ALL TO authenticated 
USING (org_id = public.get_user_org(auth.uid()));

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY evaluations_isolation ON public.evaluations FOR ALL TO authenticated 
USING (org_id = public.get_user_org(auth.uid()));

ALTER TABLE public.evaluation_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY scores_isolation ON public.evaluation_scores FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.evaluations e 
    WHERE e.id = evaluation_id AND e.org_id = public.get_user_org(auth.uid())
));

-- 4. FORÇAR RECARGA
NOTIFY pgrst, 'reload schema';
