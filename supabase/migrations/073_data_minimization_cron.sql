-- Migration: Data Minimization and Retention Policy
-- Implementation of automated cleanup for candidates ( > 24 months )

CREATE OR REPLACE FUNCTION anonymize_old_candidates()
RETURNS void AS $$
BEGIN
  -- Anonimiza candidatos de vagas fechadas há mais de 24 meses
  UPDATE candidates
  SET 
    full_name = 'Candidato Anonimizado (Política de Retenção)',
    email = 'anon@jiboia.com',
    phone = NULL,
    linkedin_url = NULL,
    portfolio_url = NULL,
    resume_url = NULL,
    notes = '[DADOS REMOVIDOS APÓS 24 MESES]'
  FROM jobs
  WHERE candidates.job_id = jobs.id
  AND jobs.status = 'closed'
  AND jobs.closed_at < NOW() - INTERVAL '24 months';

  -- Pode-se adicionar aqui a remoção física de logs muito antigos se necessário
END;
$$ LANGUAGE plpgsql;

-- Nota: Para usuários do Supabase, o agendamento real deve ser feito no Dashboard (Project Settings -> API -> pg_cron)
-- Ou via RPC disparado por uma Edge Function mensal:
-- SELECT cron.schedule('0 0 1 * *', $$ SELECT anonymize_old_candidates() $$);
