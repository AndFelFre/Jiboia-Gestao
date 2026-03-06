-- migration 045: Force Sync Admin Profile
-- Este script garante que o usuário logado tenha um perfil 'admin' completo.

DO $$
DECLARE
    v_user_id UUID := 'a8df53eb-6315-4530-8e76-137fbc5981af'; -- Seu ID que apareceu no log
    v_org_id UUID;
    v_unit_id UUID;
    v_admin_role_id UUID;
BEGIN
    RAISE NOTICE '=== SINCRONIZANDO PERFIL ADMIN ===';

    -- 1. Buscar IDs necessários
    SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'admin';
    SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'rg-digital' LIMIT 1;
    SELECT id INTO v_unit_id FROM public.units WHERE org_id = v_org_id LIMIT 1;

    -- 2. Se a organização não existir, criar uma básica
    IF v_org_id IS NULL THEN
        INSERT INTO public.organizations (name, slug) 
        VALUES ('RG Digital', 'rg-digital') 
        RETURNING id INTO v_org_id;
        
        INSERT INTO public.units (org_id, name) 
        VALUES (v_org_id, 'Matriz') 
        RETURNING id INTO v_unit_id;
    END IF;

    -- 3. Inserir ou atualizar na tabela public.users
    INSERT INTO public.users (
        id, 
        org_id, 
        unit_id, 
        role_id, 
        email, 
        full_name, 
        status
    )
    VALUES (
        v_user_id,
        v_org_id,
        v_unit_id,
        v_admin_role_id,
        'andreadm@adm.com',
        'Administrador',
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        org_id = EXCLUDED.org_id,
        unit_id = EXCLUDED.unit_id,
        role_id = EXCLUDED.role_id,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        status = 'active';

    RAISE NOTICE 'Perfil sincronizado com sucesso para o ID %', v_user_id;
END $$;

NOTIFY pgrst, 'reload schema';
