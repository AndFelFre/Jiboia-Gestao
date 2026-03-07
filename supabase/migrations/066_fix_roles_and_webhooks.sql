-- Migration 066: Saneamento de Roles e Segurança de Webhooks
-- Corrige a inconsistência da role 'dho' e padroniza políticas.

-- 1. Atualizar a constraint de CHECK na tabela roles para incluir 'dho'
-- Primeiro removemos a antiga (se existir com nome padrão ou identificamos por tipo)
DO $$
BEGIN
    -- No Supabase/Postgres, constraints de CHECK podem ter nomes gerados. 
    -- Vamos garantir que a role 'dho' exista e a constraint a aceite.
    ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS roles_name_check;
    ALTER TABLE public.roles ADD CONSTRAINT roles_name_check CHECK (name IN ('admin', 'leader', 'employee', 'recruiter', 'dho'));
    
    -- Inserir a role DHO se não existir
    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'dho') THEN
        INSERT INTO public.roles (name, permissions) 
        VALUES ('dho', '{"manage_team": true, "evaluations": true, "recruitment": true, "org.manage": true}'::jsonb);
    END IF;
END $$;

-- 2. Corrigir a política de Webhooks para ser resiliente
DROP POLICY IF EXISTS "Admins can manage webhooks" ON public.webhooks;
CREATE POLICY "Admins can manage webhooks"
    ON public.webhooks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND u.org_id = webhooks.org_id
            AND r.name IN ('admin', 'dho')
        )
    );

-- 3. Índice para acelerar a busca de roles por nome (usado em RLS)
CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles(name);

-- 4. Notificar recarga
NOTIFY pgrst, 'reload schema';
