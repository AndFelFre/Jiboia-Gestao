-- DIAGNOSTIC 051: Check Evaluation Relationships
-- Verifica se a avaliação solicitada existe e se seus relacionamentos estão íntegros.

SELECT 
    e.id as evaluation_id,
    e.user_id,
    e.evaluator_id,
    u.full_name as user_name,
    u.position_id,
    p.title as position_title,
    (SELECT count(*) FROM position_skills ps WHERE ps.position_id = u.position_id) as skill_count
FROM public.evaluations e
JOIN public.users u ON e.user_id = u.id
LEFT JOIN public.positions p ON u.position_id = p.id
WHERE e.id = 'a5cfe697-d836-46c1-8054-e80fe4ea81f5';
