-- PARTE 3 - Vincular e finalizar

INSERT INTO users (id, org_id, unit_id, role_id, email, full_name, status) SELECT u.id, o.id, un.id, r.id, 'andreadm@adm.com', 'Administrador', 'active' FROM auth.users u CROSS JOIN organizations o CROSS JOIN units un CROSS JOIN roles r WHERE u.email = 'andreadm@adm.com' AND o.slug = 'rg-digital' AND un.name = 'Matriz' AND r.name = 'admin' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'andreadm@adm.com');

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS temp_allow_all ON organizations;
DROP POLICY IF EXISTS temp_allow_all ON units;
DROP POLICY IF EXISTS temp_allow_all ON users;
DROP POLICY IF EXISTS temp_allow_all ON roles;

CREATE POLICY temp_allow_all ON organizations FOR ALL TO authenticated USING (true);
CREATE POLICY temp_allow_all ON units FOR ALL TO authenticated USING (true);
CREATE POLICY temp_allow_all ON users FOR ALL TO authenticated USING (true);
CREATE POLICY temp_allow_all ON roles FOR ALL TO authenticated USING (true);

SELECT email, status FROM users WHERE email = 'andreadm@adm.com';
