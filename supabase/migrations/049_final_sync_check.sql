-- DIAGNOSTIC 049: Final Performance Sync Check
-- Verifica se o admin agora tem o cargo e as skills vinculadas.

SELECT 
    u.id, 
    u.email, 
    u.full_name,
    p.title as position_title,
    count(ps.skill_id) as total_skills
FROM public.users u
LEFT JOIN public.positions p ON u.position_id = p.id
LEFT JOIN public.position_skills ps ON p.id = ps.position_id
WHERE u.email = 'andreadm@adm.com'
GROUP BY u.id, u.email, u.full_name, p.title;

-- Ver se já existe algum ciclo (deve estar vazio ainda, mas pronto para criar)
SELECT count(*) FROM public.evaluations;
