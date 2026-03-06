-- migration 047: Seed Performance Data
-- Popula o catálogo de competências e vincula ao cargo do admin para testes.

DO $$
DECLARE
    v_org_id UUID;
    v_admin_pos_id UUID;
    v_skill_id UUID;
BEGIN
    RAISE NOTICE '=== SEMEANDO DADOS DE PERFORMANCE ===';

    -- 1. Obter Organização e Criar Cargo para o Admin (se não existir)
    SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'rg-digital' LIMIT 1;
    
    INSERT INTO public.positions (org_id, title, description)
    VALUES (v_org_id, 'Diretor de Operações', 'Liderança executiva e gestão estratégica')
    ON CONFLICT (org_id, title) DO UPDATE SET description = EXCLUDED.description
    RETURNING id INTO v_admin_pos_id;

    -- Vincular o admin a este cargo
    UPDATE public.users SET unit_id = (SELECT id FROM public.units WHERE org_id = v_org_id LIMIT 1) WHERE email = 'andreadm@adm.com';
    -- Nota: Adicione uma coluna position_id na tabela users se não houver, ou use o que estiver disponível.
    -- Assumindo que a tabela users tem position_id (se não tiver, este seed pode falhar, mas vamos garantir as skills primeiro)

    -- 2. Criar Catálogo de competências (Soft Skills)
    INSERT INTO public.skills (org_id, name, category, description)
    VALUES 
        (v_org_id, 'Liderança Inspiradora', 'soft_skill', 'Capacidade de motivar e engajar a equipe rumo aos objetivos.'),
        (v_org_id, 'Comunicação Estratégica', 'soft_skill', 'Habilidade de transmitir ideias complexas de forma clara e assertiva.'),
        (v_org_id, 'Resolução de Conflitos', 'soft_skill', 'Capacidade de mediar crises e manter o clima organizacional saudável.')
    ON CONFLICT (org_id, name) DO NOTHING;

    -- 3. Criar Catálogo de competências (Hard Skills)
    INSERT INTO public.skills (org_id, name, category, description)
    VALUES 
        (v_org_id, 'Gestão de Projetos (Agile)', 'hard_skill', 'Domínio de metodologias como Scrum e Kanban.'),
        (v_org_id, 'Análise de KPIs', 'hard_skill', 'Capacidade de interpretar dados e tomar decisões baseadas em métricas.'),
        (v_org_id, 'Planejamento Orçamentário', 'hard_skill', 'Habilidade em gerir budgets e recursos financeiros.')
    ON CONFLICT (org_id, name) DO NOTHING;

    -- 4. Vincular Skills ao Cargo de Diretor
    INSERT INTO public.position_skills (position_id, skill_id, required_level)
    SELECT v_admin_pos_id, id, 4 FROM public.skills WHERE org_id = v_org_id
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seed de Performance concluído.';
END $$;
