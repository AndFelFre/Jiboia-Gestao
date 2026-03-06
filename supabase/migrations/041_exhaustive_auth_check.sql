-- DIAGNOSTIC 041: Final Auth Table Inspection
-- Lista TODAS as colunas e valores do admin para caçar campos nulos remanescentes.

SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users';

SELECT * FROM auth.users WHERE email = 'andreadm@adm.com';
