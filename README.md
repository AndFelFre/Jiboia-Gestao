# RG Digital - Sistema de Gestão de Colaboradores

Sistema para guiar, mensurar, avaliar e estruturar o desenvolvimento de colaboradores do recrutamento à promoção.

## Stack Tecnológico

- **Next.js 14** (App Router + Server Actions)
- **TypeScript** (tipagem end-to-end)
- **Tailwind CSS** (estilização)
- **Supabase** (PostgreSQL + Auth + RLS)
- **Zod** (validação de schemas)
- **React Hook Form** (formulários)

## Estrutura do Projeto

```
src/
├── app/                    # Rotas e páginas
│   ├── login/             # Página de login
│   ├── dashboard/         # Dashboard principal
│   ├── api/               # API routes
│   └── (dashboard)/       # Grupo de rotas do dashboard (a implementar)
├── components/            # Componentes React
│   └── ui/               # Componentes base
├── lib/                   # Utilitários
│   ├── supabase/         # Clientes Supabase (browser/server/admin)
│   └── utils.ts          # Funções utilitárias
├── types/                 # Tipos TypeScript
└── validations/          # Schemas Zod

supabase/
└── migrations/           # Migrations do banco de dados
```

## Setup Local

### 1. Clone e Instale Dependências

```bash
cd rg-digital
npm install
```

### 2. Configure Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 3. Configure o Banco de Dados no Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Vá em SQL Editor > New Query
3. Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Execute o script

### 4. Rode o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

### 5. Crie o Primeiro Usuário Admin

1. No Supabase, vá em Authentication > Users > Add User
2. Crie um usuário com email e senha
3. No SQL Editor, execute:

```sql
-- Crie uma organização
INSERT INTO organizations (name, slug) 
VALUES ('Minha Empresa', 'minha-empresa');

-- Crie uma unidade
INSERT INTO units (org_id, name) 
SELECT id, 'Matriz' FROM organizations WHERE slug = 'minha-empresa';

-- Atualize o usuário para admin
UPDATE users 
SET 
  role_id = (SELECT id FROM roles WHERE name = 'admin'),
  org_id = (SELECT id FROM organizations WHERE slug = 'minha-empresa'),
  unit_id = (SELECT id FROM units WHERE name = 'Matriz'),
  status = 'active'
WHERE email = 'email-do-admin@exemplo.com';
```

## Scripts Disponíveis

```bash
npm run dev       # Desenvolvimento
npm run build     # Build de produção
npm run start     # Inicia servidor de produção
npm run lint      # ESLint
npm run check     # Lint + Build (validação completa)
npm run typecheck # Verificação de tipos TypeScript
```

## Próximos Passos

1. [ ] Implementar cadastro de organização/unidades
2. [ ] Implementar CRUD de cargos/níveis/trilhas
3. [ ] Módulo de Recrutamento (vagas + pipeline + STAR)
4. [ ] Módulo de Onboarding (D0, D15, D30/D60)
5. [ ] Módulo de Rotina (Barra Mínima, Funil, Pins)
6. [ ] Módulo de Avaliação (RUA + SMART)
7. [ ] Módulo de PDI e Progressão

## Segurança

- RLS (Row Level Security) ativado em todas as tabelas
- Validação de inputs com Zod no servidor
- Server Actions para operações críticas
- Auditoria de todas as alterações (audit_logs)
- RBAC com 4 papéis: admin, leader, employee, recruiter

## Deploy

### Supabase
1. O banco já está no Supabase Cloud
2. Configure as variáveis de ambiente na Vercel

### Vercel
1. Conecte o repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

## Licença

Privado - Uso interno apenas.
