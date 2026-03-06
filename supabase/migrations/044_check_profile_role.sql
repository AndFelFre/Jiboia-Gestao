-- DIAGNOSTIC 044: Check User Profile and Roles
-- Vamos verificar se o admin tem perfil e role vinculada.

SELECT 
    u.id, 
    u.email, 
    u.status, 
    u.role_id, 
    r.name as role_name
FROM public.users u
LEFT JOIN public.roles r ON u.role_id = r.id
WHERE u.email = 'andreadm@adm.com';

-- Verificar todas as roles existentes
SELECT * FROM public.roles;
