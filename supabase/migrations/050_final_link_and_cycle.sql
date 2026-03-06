-- migration 050: Final Link and First Cycle
-- Vincula o cargo ao admin e cria o primeiro ciclo de teste.

DO $$
DECLARE
    v_user_id UUID := 'a8df53eb-6315-4530-8e76-137fbc5981af';
    v_admin_pos_id UUID;
    v_org_id UUID;
BEGIN
    RAISE NOTICE '=== VINCULANDO CARGO E CRIANDO CICLO ===';

    -- 1. Obter IDs
    SELECT id INTO v_admin_pos_id FROM public.positions WHERE title = 'Diretor de Operações' LIMIT 1;
    SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'rg-digital' LIMIT 1;

    -- 2. Atualizar o usuário com o cargo
    UPDATE public.users 
    SET position_id = v_admin_pos_id 
    WHERE id = v_user_id;

    -- 3. Criar primeiro ciclo de avaliação para o próprio admin (autotransparência)
    -- Isso permite testar o formulário imediatamente
    IF NOT EXISTS (SELECT 1 FROM public.evaluations WHERE user_id = v_user_id AND cycle_name = 'Ciclo de Experiência') THEN
        INSERT INTO public.evaluations (
            org_id, 
            user_id, 
            evaluator_id, 
            cycle_name, 
            status
        ) VALUES (
            v_org_id,
            v_user_id,
            v_user_id, -- Avaliando a si mesmo para teste
            'Ciclo de Experiência',
            'open'
        );
    END IF;

    RAISE NOTICE 'Vínculo concluído e ciclo criado.';
END $$;

NOTIFY pgrst, 'reload schema';
