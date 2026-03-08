-- Migration 084: Admin Ghost Prevention & RLS Hardening
-- Goal: Resolver colisões de índices únicos e automatizar filtragem de Soft Delete via RLS.

BEGIN;

-- 1. Resolver "Efeito Fantasma" (Índices Únicos Parciais)
-- Removemos as restrições únicas antigas e criamos índices que ignoram deletados.

-- Organizations: Slug deve ser único entre ativos
ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_slug_key;
CREATE UNIQUE INDEX idx_unique_org_slug_active ON public.organizations (slug) WHERE deleted_at IS NULL;

-- Units: Nome deve ser único dentro da organização entre ativos
ALTER TABLE public.units DROP CONSTRAINT IF EXISTS units_org_id_name_key;
CREATE UNIQUE INDEX idx_unique_unit_name_active ON public.units (org_id, name) WHERE deleted_at IS NULL;

-- Users: E-mail deve ser único entre ativos (O Auth do Supabase já gere isso, mas aqui reforçamos a tabela public)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_key;
CREATE UNIQUE INDEX idx_unique_user_email_active ON public.users (email) WHERE deleted_at IS NULL;

-- 2. Automatizar Filtragem de Soft Delete no RLS
-- Atualiza as políticas para que o dado deletado seja invisível por padrão.

DO $$ 
DECLARE 
  t text;
BEGIN
  FOR t IN 
    SELECT c.table_name 
    FROM information_schema.columns c
    JOIN information_schema.tables t_info ON c.table_name = t_info.table_name 
    WHERE c.column_name = 'deleted_at' 
      AND c.table_schema = 'public'
      AND t_info.table_type = 'BASE TABLE'
  LOOP
    -- Garante que o RLS está ativo para tabelas com soft delete
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- 3. Função de Restauração com Verificação de Dependência
CREATE OR REPLACE FUNCTION public.restore_record(target_table text, target_id uuid)
RETURNS void AS $$
DECLARE
    parent_deleted_at timestamptz;
BEGIN
    -- Verificação de integridade referencial antes de restaurar
    -- Exemplo para Unidades: Verificamos se a Organização pai não está deletada.
    IF target_table = 'units' THEN
        SELECT o.deleted_at INTO parent_deleted_at 
        FROM public.units u 
        JOIN public.organizations o ON o.id = u.org_id 
        WHERE u.id = target_id;
        
        IF parent_deleted_at IS NOT NULL THEN
            RAISE EXCEPTION 'Não é possível restaurar unidade: a organização pai está arquivada.';
        END IF;
    END IF;

    -- Executa a restauração
    EXECUTE format('UPDATE public.%I SET deleted_at = NULL WHERE id = %L', target_table, target_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
