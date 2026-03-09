# Jiboia - Gestão Operacional e Estratégica 🐍

O **Jiboia** é um sistema enterprise de gestão de capital humano e performance operacional (DHO). Ele transforma ritos de rotina em inteligência estratégica, estruturando o ciclo de vida do colaborador desde o recrutamento até a calibração de talentos (9-Box).

---

## 🏗️ Arquitetura e Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Engine de Dados**: [Supabase](https://supabase.com/) (PostgreSQL + RLS + Admin Client)
- **Frontend**: Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/) + Lucide Icons
- **Tipagem**: TypeScript (End-to-End Type Safety)
- **Validação**: Zod (Esquemas compartilhados Client/Server)
- **Segurança**: Magic Link Auth + RBAC + Row Level Security (RLS)

---

## 📂 Mapa do Projeto (Estrutura de Pastas)

```text
src/
├── app/                        # Next.js App Router (Rotas e Layouts)
│   ├── (dashboard)/            # Dashboard principal do usuário
│   ├── admin/                  # Painel Administrativo (Gestão de Orgs, Users, Units)
│   │   ├── actions/            # Server Actions para operações administrativas
│   │   ├── organizations/      # Hub Centralizado da Organização ([id]/page.tsx)
│   │   └── users/              # Gestão de Usuários e Convites
│   ├── careers/                # Portal Público de Recrutamento (Segurança Camada 7)
│   ├── routine/                # Check-ins e Ritos diários/semanais
│   └── setup/                  # Fluxo de Onboarding inicial de empresas
├── components/                 # Componentes React Reutilizáveis
│   ├── admin/                  # Componentes específicos de Admin (QuickCreate, Delete)
│   ├── ui/                     # Primitivos Shadcn UI (Dialog, Button, etc.)
│   └── feedback/               # Toasts e EmptyStates
├── lib/                        # Utilitários de Infraestrutura
│   ├── supabase/               # Configuração (Server, Client, Admin, Audit)
│   │   ├── audit.ts            # Motor de auditoria JSONB Delta
│   │   └── server.ts           # Instância segura para Server Components
│   └── kpi-engine.ts           # Motor de cálculo de métricas operacionais
├── services/                   # Lógica de Negócio (Domain Services)
│   └── recruitment/            # Gestão de fluxos de vagas e candidatos
├── types/                      # Definições de tipos globais
├── utils/                      # Funções helpers genéricas
└── validations/                # Schemas Zod (Single Source of Truth)
```

---

## 🚀 Fluxos Core de Engenharia

### 1. Hub Centralizado & Multi-tenancy
O sistema opera sob um modelo **Multi-tenant** rigoroso. A `org_id` é a raiz de toda a segurança.
- **Hub Contextual**: Ao acessar `/admin/organizations/[id]`, o gestor tem visão 360 (Equipe, Unidades, Cargos) filtrada automaticamente.
- **Isolamento RLS**: Políticas do PostgreSQL garantem que um usuário nunca veja dados de outra organização, mesmo manipulando IDs no frontend.

### 2. Fluxo de Usuários (Atomicidade 088)
O convite de usuários utiliza o **Magic Link** do Supabase Admin.
- **Rollback Transacional**: Se a criação do perfil no banco falhar após o Auth ser criado, o sistema deleta automaticamente a credencial órfã.
- **Criação Inline**: Dentro do formulário de usuário, dependências (Unidades/Cargos) podem ser criadas via modais sem sair da página (Portals).

### 3. Fortaleza de Recrutamento (`/careers`)
O portal público é um **Vault de Escrita Única**:
- **Anti-Spam**: Cloudflare Turnstile + Rate Limiting via Middleware.
- **Uploads Seguros**: Currículos são enviados para Buckets privados com nomes anonimizados e visualização via URLs assinadas.

### 4. Inteligência Operacional (DHO)
- **KPI Engine**: Cálculos determinísticos de rampagem, engajamento e prontidão.
- **9-Box Calibration**: Matrizes de calibração com snapshots periódicos para histórico de carreira.

---

## 🛡️ Governança e Segurança

- **Auditoria Master**: Triggers no banco capturam cada mudança em JSONB, permitindo o `AuditDiffViewer`.
- **LGPD Compliance**: RPC `anonymize_user` para expurgo completo de dados sob demanda (Direito ao Esquecimento).
- **Service Tags**: Uso agressivo de `revalidateTag` para cache granular e atualizações instantâneas.

---

## 💻 Desenvolvimento Local

1.  **Instalação**: `npm install`
2.  **Ambiente**: Renomeie `.env.example` para `.env.local` e insira as chaves do Supabase.
3.  **Execução**: `npm run dev`
4.  **Verificação**:
    -   `npm run lint` (Estilo)
    -   `npm run typecheck` (Tipagem)
    -   `npm run build` (Integridade de Produção)

---

**Jiboia Gestão - Tecnologia a serviço do desenvolvimento humano.**