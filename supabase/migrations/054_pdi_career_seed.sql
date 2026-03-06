-- migration 054: Career Track and PDI Seed
-- Configura uma trilha de carreira para o Diretor e cria o primeiro plano de PDI.

DO $$
DECLARE
    v_org_id UUID;
    v_track_id UUID;
    v_level_1_id UUID;
    v_level_2_id UUID;
    v_pos_1_id UUID;
    v_pos_2_id UUID;
    v_admin_id UUID := 'a8df53eb-6315-4530-8e76-137fbc5981af';
BEGIN
    RAISE NOTICE '=== SEMEANDO TRILHA DE CARREIRA E PDI ===';

    SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'rg-digital' LIMIT 1;

    -- 1. Criar Trilha de Liderança
    INSERT INTO public.tracks (org_id, name, description)
    VALUES (v_org_id, 'Trilha Executiva', 'Caminho de crescimento para liderança estratégica.')
    ON CONFLICT DO NOTHING RETURNING id INTO v_track_id;

    IF v_track_id IS NULL THEN
        SELECT id INTO v_track_id FROM public.tracks WHERE name = 'Trilha Executiva' LIMIT 1;
    END IF;

    -- 2. Criar Níveis (Sequência 1 e 2)
    INSERT INTO public.levels (org_id, name, sequence, min_time_months)
    VALUES (v_org_id, 'Diretor Nível 1', 1, 12)
    ON CONFLICT DO NOTHING RETURNING id INTO v_level_1_id;

    INSERT INTO public.levels (org_id, name, sequence, min_time_months)
    VALUES (v_org_id, 'Diretor Nível 2', 2, 24)
    ON CONFLICT DO NOTHING RETURNING id INTO v_level_2_id;

    IF v_level_1_id IS NULL THEN SELECT id INTO v_level_1_id FROM public.levels WHERE name = 'Diretor Nível 1' LIMIT 1; END IF;
    IF v_level_2_id IS NULL THEN SELECT id INTO v_level_2_id FROM public.levels WHERE name = 'Diretor Nível 2' LIMIT 1; END IF;

    -- 3. Atualizar Cargo Atual (Diretor de Operações) com Track e Level
    UPDATE public.positions 
    SET track_id = v_track_id, level_id = v_level_1_id 
    WHERE title = 'Diretor de Operações' AND org_id = v_org_id
    RETURNING id INTO v_pos_1_id;

    -- 4. Criar Próximo Cargo (Diretor Executivo / COO)
    INSERT INTO public.positions (org_id, title, level_id, track_id, description)
    VALUES (v_org_id, 'Diretor Executivo (COO)', v_level_2_id, v_track_id, 'Liderança máxima de todas as operações globais.')
    ON CONFLICT (org_id, title) DO UPDATE SET level_id = v_level_2_id, track_id = v_track_id
    RETURNING id INTO v_pos_2_id;

    -- 5. Definir Requisitos (Skills) para o Próximo Cargo (Gaps para o PDI)
    -- Skill 1: Liderança Inspiradora (Requisito 5)
    INSERT INTO public.position_skills (position_id, skill_id, required_level)
    SELECT v_pos_2_id, id, 5 FROM public.skills WHERE name = 'Liderança Inspiradora' AND org_id = v_org_id
    ON CONFLICT DO NOTHING;

    -- Skill 2: Planejamento Orçamentário (Requisito 5)
    INSERT INTO public.position_skills (position_id, skill_id, required_level)
    SELECT v_pos_2_id, id, 5 FROM public.skills WHERE name = 'Planejamento Orçamentário' AND org_id = v_org_id
    ON CONFLICT DO NOTHING;

    -- 6. Criar o Plano de PDI Ativo para o Admin
    INSERT INTO public.pdi_plans (org_id, user_id, title, description, status)
    VALUES (v_org_id, v_admin_id, 'Plano de Crescimento Executivo 2026', 'Foco em atingir a cadeira de COO.', 'active')
    ON CONFLICT (user_id, status) DO NOTHING;

    RAISE NOTICE 'Seed de Trilha e PDI concluído.';
END $$;
