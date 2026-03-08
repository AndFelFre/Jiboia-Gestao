-- Migration 093: Bucket de Currículos e RLS de Storage
-- Cria o bucket 'resumes' e define políticas de acesso estritas

BEGIN;

-- 1. Inserir o bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Anon pode apenas FAZER UPLOAD (INSERT)
-- Não permitimos que anon leia ou liste nada
CREATE POLICY "Public anon can upload resumes"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'resumes');

-- 3. Política: Admins logados podem LER (SELECT)
CREATE POLICY "Admins can view resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resumes');

-- 4. Política: Admins logados podem DELETAR
CREATE POLICY "Admins can delete resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resumes');

COMMIT;
