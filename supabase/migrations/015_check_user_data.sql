-- VERIFICAR DADOS COMPLETOS DO USUÁRIO

SELECT 
  u.id,
  u.email,
  u.full_name,
  u.status,
  u.org_id,
  u.unit_id,
  u.role_id,
  o.name as org_name,
  un.name as unit_name,
  r.name as role_name
FROM users u
LEFT JOIN organizations o ON u.org_id = o.id
LEFT JOIN units un ON u.unit_id = un.id
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'andreadm@adm.com';
