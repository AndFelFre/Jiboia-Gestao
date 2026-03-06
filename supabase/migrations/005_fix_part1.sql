-- PARTE 1 - Cole no SQL Editor

-- Desativar RLS
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;

-- Criar roles
INSERT INTO roles (id, name, permissions) SELECT gen_random_uuid(), 'admin', '{"all": true}'::jsonb WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin');
INSERT INTO roles (id, name, permissions) SELECT gen_random_uuid(), 'leader', '{"manage_team": true, "evaluations": true, "recruitment": true}'::jsonb WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'leader');
INSERT INTO roles (id, name, permissions) SELECT gen_random_uuid(), 'employee', '{"view_own": true, "routines": true}'::jsonb WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'employee');
INSERT INTO roles (id, name, permissions) SELECT gen_random_uuid(), 'recruiter', '{"recruitment": true}'::jsonb WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'recruiter');

-- Criar organizacao
INSERT INTO organizations (id, name, slug, settings) VALUES (gen_random_uuid(), 'RG Digital', 'rg-digital', '{"timezone": "America/Sao_Paulo", "currency": "BRL"}'::jsonb) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Criar unidade
INSERT INTO units (id, org_id, name, parent_id) SELECT gen_random_uuid(), id, 'Matriz', NULL FROM organizations WHERE slug = 'rg-digital' ON CONFLICT DO NOTHING;

-- Verificar
SELECT 'OK' as status;
