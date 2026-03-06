-- DIAGNOSTIC 046: Performance Tables Health Check
-- Verificando se as tabelas de performance existem e se há dados nelas.

SELECT 'skills' as table_name, count(*) as total FROM public.skills
UNION ALL
SELECT 'position_skills' as table_name, count(*) as total FROM public.position_skills
UNION ALL
SELECT 'evaluations' as table_name, count(*) as total FROM public.evaluations
UNION ALL
SELECT 'evaluation_scores' as table_name, count(*) as total FROM public.evaluation_scores;

-- Verificar se o admin tem skills vinculadas ao seu cargo (para podermos testar o form)
SELECT 
    p.title as position_title,
    s.name as skill_name,
    ps.required_level
FROM public.users u
JOIN public.positions p ON u.unit_id IS NOT NULL -- ajuste simplificado para ver o cargo
JOIN public.position_skills ps ON p.id = ps.position_id
JOIN public.skills s ON ps.skill_id = s.id
WHERE u.email = 'andreadm@adm.com';
