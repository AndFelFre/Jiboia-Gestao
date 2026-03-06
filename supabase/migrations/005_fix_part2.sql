-- PARTE 2 - Criar usuario auth

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) SELECT '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'andreadm@adm.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Administrador"}'::jsonb, NOW(), NOW(), '', '', '', '' WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'andreadm@adm.com');

UPDATE auth.users SET encrypted_password = crypt('123456', gen_salt('bf')), email_confirmed_at = NOW(), updated_at = NOW() WHERE email = 'andreadm@adm.com';

SELECT id FROM auth.users WHERE email = 'andreadm@adm.com';
