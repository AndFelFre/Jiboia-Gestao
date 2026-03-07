-- Migration 067: Fix Levels and Write Permissions
-- Garante que admins e usuários autorizados possam criar/editar níveis, trilhas e unidades.

-- 1. Níveis de Carreira (LEVELS)
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS levels_admin_all ON public.levels;
CREATE POLICY levels_admin_all ON public.levels 
FOR ALL TO authenticated 
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS levels_org_isolation ON public.levels;
CREATE POLICY levels_org_isolation ON public.levels 
FOR ALL TO authenticated 
USING (org_id = public.get_user_org(auth.uid()))
WITH CHECK (org_id = public.get_user_org(auth.uid()));

-- 2. Trilhas de Carreira (TRACKS)
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tracks_admin_all ON public.tracks;
CREATE POLICY tracks_admin_all ON public.tracks 
FOR ALL TO authenticated 
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS tracks_org_isolation ON public.tracks;
CREATE POLICY tracks_org_isolation ON public.tracks 
FOR ALL TO authenticated 
USING (org_id = public.get_user_org(auth.uid()))
WITH CHECK (org_id = public.get_user_org(auth.uid()));

-- 3. Unidades (UNITS)
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS units_admin_all ON public.units;
CREATE POLICY units_admin_all ON public.units 
FOR ALL TO authenticated 
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS units_org_isolation ON public.units;
CREATE POLICY units_org_isolation ON public.units 
FOR ALL TO authenticated 
USING (org_id = public.get_user_org(auth.uid()))
WITH CHECK (org_id = public.get_user_org(auth.uid()));

-- 4. Notificar recarga de schema
NOTIFY pgrst, 'reload schema';
