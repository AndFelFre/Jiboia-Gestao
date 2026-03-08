-- Migration 086: Admin Cascading Restore Logic
-- Goal: Implementar restauração em cascata inteligente baseada em tempo.

BEGIN;

CREATE OR REPLACE FUNCTION public.restore_record(
    target_table text, 
    target_id uuid,
    cascade_children boolean DEFAULT false
)
RETURNS void AS $$
DECLARE
    parent_deleted_at timestamptz;
    record_deleted_at timestamptz;
BEGIN
    -- 1. Capturar a data de deleção do registro antes de restaurar
    EXECUTE format('SELECT deleted_at FROM public.%I WHERE id = %L', target_table, target_id) INTO record_deleted_at;

    -- 2. Verificação de integridade referencial
    IF target_table = 'units' THEN
        SELECT o.deleted_at INTO parent_deleted_at 
        FROM public.units u 
        JOIN public.organizations o ON o.id = u.org_id 
        WHERE u.id = target_id;
        
        IF parent_deleted_at IS NOT NULL THEN
            RAISE EXCEPTION 'Não é possível restaurar unidade: a organização pai está arquivada.';
        END IF;
    END IF;

    IF target_table = 'users' THEN
        SELECT o.deleted_at INTO parent_deleted_at 
        FROM public.users u 
        JOIN public.organizations o ON o.id = u.org_id 
        WHERE u.id = target_id;
        
        IF parent_deleted_at IS NOT NULL THEN
            RAISE EXCEPTION 'Não é possível restaurar usuário: a organização pai está arquivada.';
        END IF;
    END IF;

    -- 3. Executa a restauração do registro principal
    EXECUTE format('UPDATE public.%I SET deleted_at = NULL WHERE id = %L', target_table, target_id);

    -- 4. Restauração em Cascata Inteligente (Children)
    -- Se cascade_children for true, restauramos registros que foram deletados na mesma janela de tempo (aprox. 5 segundos)
    IF cascade_children AND target_table = 'organizations' THEN
        -- Restaura Unidades da Org
        UPDATE public.units 
        SET deleted_at = NULL 
        WHERE org_id = target_id 
        AND deleted_at IS NOT NULL 
        AND ABS(EXTRACT(EPOCH FROM (deleted_at - record_deleted_at))) < 5;

        -- Restaura Usuários da Org
        UPDATE public.users 
        SET deleted_at = NULL 
        WHERE org_id = target_id 
        AND deleted_at IS NOT NULL 
        AND ABS(EXTRACT(EPOCH FROM (deleted_at - record_deleted_at))) < 5;
    END IF;

    IF cascade_children AND target_table = 'units' THEN
        -- Restaura Subunidades (parent_id)
        UPDATE public.units 
        SET deleted_at = NULL 
        WHERE parent_id = target_id 
        AND deleted_at IS NOT NULL 
        AND ABS(EXTRACT(EPOCH FROM (deleted_at - record_deleted_at))) < 5;
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
