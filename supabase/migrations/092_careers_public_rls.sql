-- Migration 092: RLS + Trigger para Portal Público de Carreiras
-- Anon pode LER vagas abertas e INSERIR candidaturas (Write-Only Vault)
-- Trigger BEFORE INSERT preenche org_id automaticamente a partir da vaga

BEGIN;

-- ========================================
-- 1. Jobs: anon pode LER apenas vagas abertas
-- ========================================
DROP POLICY IF EXISTS careers_public_read_open_jobs ON public.jobs;
CREATE POLICY careers_public_read_open_jobs
    ON public.jobs
    FOR SELECT
    TO anon
    USING (status = 'open');

-- ========================================
-- 2. Trigger: preenche org_id do candidato a partir da vaga
-- O front-end NUNCA envia org_id — o banco preenche sozinho
-- ========================================
CREATE OR REPLACE FUNCTION public.set_candidate_org_from_job()
RETURNS TRIGGER AS $$
BEGIN
    -- Busca o org_id da vaga diretamente no banco
    SELECT org_id INTO NEW.org_id
    FROM public.jobs
    WHERE id = NEW.job_id;

    -- Se a vaga não existe, abortar
    IF NEW.org_id IS NULL THEN
        RAISE EXCEPTION 'Vaga não encontrada ou inválida (job_id: %)', NEW.job_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop se existir (idempotente)
DROP TRIGGER IF EXISTS trg_set_candidate_org ON public.candidates;

CREATE TRIGGER trg_set_candidate_org
    BEFORE INSERT ON public.candidates
    FOR EACH ROW
    EXECUTE FUNCTION public.set_candidate_org_from_job();

-- ========================================
-- 3. Candidates: anon pode apenas INSERIR (Write-Only Vault)
-- WITH CHECK: org_id TEM que bater com o org_id da vaga
-- ========================================
DROP POLICY IF EXISTS careers_public_insert_candidate ON public.candidates;
CREATE POLICY careers_public_insert_candidate
    ON public.candidates
    FOR INSERT
    TO anon
    WITH CHECK (
        -- Dupla validação: vaga existe, está aberta, E org_id bate
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE jobs.id = candidates.job_id
            AND jobs.status = 'open'
            AND jobs.org_id = candidates.org_id
        )
    );

COMMIT;
