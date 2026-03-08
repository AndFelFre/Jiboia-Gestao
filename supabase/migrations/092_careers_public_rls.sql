-- Migration 092: RLS para Portal Público de Carreiras
-- Permite anon LEITURA de vagas abertas e ESCRITA de candidaturas
-- Bloqueia qualquer SELECT/UPDATE/DELETE anon em candidates

BEGIN;

-- ========================================
-- 1. Jobs: anon pode LER apenas vagas abertas
-- ========================================
CREATE POLICY careers_public_read_open_jobs
    ON public.jobs
    FOR SELECT
    TO anon
    USING (status = 'open');

-- ========================================
-- 2. Candidates: anon pode apenas INSERIR (Write-Only Vault)
-- ========================================
CREATE POLICY careers_public_insert_candidate
    ON public.candidates
    FOR INSERT
    TO anon
    WITH CHECK (
        -- Só aceita se a vaga existe e está aberta
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE jobs.id = candidates.job_id
            AND jobs.status = 'open'
        )
    );

-- Anon NÃO pode ler, atualizar ou deletar candidatos (já está implícito
-- pelo RLS ativo + ausência de policy de SELECT/UPDATE/DELETE para anon,
-- mas explicitamos para clareza documental)

COMMIT;
