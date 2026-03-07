# Jiboia - Gestão Operacional e Estratégica

O **Jiboia** é um sistema de gestão de capital humano e performance operacional, projetado para estruturar o ciclo de vida do colaborador, desde a entrada até a alta performance. O foco do sistema é transformar dados de rotina em inteligência estratégica para lideranças.

---

## 🎯 Objetivo do Projeto

O projeto visa resolver a falta de visibilidade sobre a saúde, o desenvolvimento e o potencial das equipes. Através do módulo **DHO Operacional**, o sistema permite que gestores acompanhem em tempo real se seus liderados estão engajados, treinados e prontos para sucessão, utilizando dados determinísticos e auditoria de ritos.

---

## 🧩 Modelo de Domínio (DHO)

A lógica do DHO é baseada em sete pilares de dados:

*   **Onboarding**: Jornada tática inicial (D0–D90) focada em rampagem.
*   **PDI & SMART**: Plano de Desenvolvimento Individual com metas táticas vinculadas.
*   **Ritos**: Registro de One-on-Ones e feedbacks periódicos de liderança.
*   **Performance (RUA)**: Avaliação comportamental nos eixos de Resiliência, Utilidade e Ambição.
*   **Calibração (9-Box)**: Matriz de potencial vs. desempenho com snapshot histórico.
*   **Scorecard**: Cálculo derivado da saúde do colaborador em tempo real.
*   **Alertas Preventivos**: Detecção automática de riscos (ritos vencidos, baixa rampagem).

---

## 🏗️ Arquitetura e Engenharia

- **Server-Side First**: Uso extensivo de **React Server Components (RSC)** e **Server Actions** para segurança e performance.
- **Atomicidade e Concorrência**: Operações críticas de fechamento de ciclo protegidas por **Optimistic Locking** para garantir integridade.
- **Privacidade Estrutural**: Dados sensíveis (como Potencial e 9-Box) são blindados via RLS e filtros de backend, invisíveis ao colaborador avaliado.
- **Lógica Derivada**: Indicadores operacionais calculados *on-the-fly* via `dho-utils.ts`, evitando redundância e inconsistência.

---

## 🛡️ Segurança e Multi-tenancy

- **Isolamento de Dados**: Separação rigorosa entre organizações via **Supabase RLS**.
- **RBAC Robusto**: Controle de acesso por papéis (`ADMIN`, `LEADER`, `USER`) validado tanto na UI quanto no protocolo das Server Actions.
- **Auditoria**: Log de eventos (`audit_logs`) para construção automática da Timeline do Colaborador.

---

## 🛠️ Stack Tecnológico

- **Core**: Next.js 14 (App Router)
- **Linguagem**: TypeScript (End-to-End Type Safety)
- **Banco de Dados**: Supabase (PostgreSQL + RLS + Triggers)
- **UI/UX**: Tailwind CSS + shadcn/ui + Lucide Icons
- **Validação & IA**: Zod + OpenAI (IA para Planos de Sucessão)

---

## 🚀 Funcionalidades Principais

1.  **Timeline**: Registro cronológico automático de marcos e eventos de carreira.
2.  **Rampagem de Onboarding**: Monitoramento visual por fases (D30, D60, D90).
3.  **Gestão de Ritos**: Fluxo resiliente de registro de 1:1s e feedbacks.
4.  **Avaliação RUA + SMART**: Ciclos de desempenho comportamental e tático.
5.  **Matriz 9-Box**: Painel estratégico de calibração de talentos e sucessão.
6.  **Scorecard Dinâmico**: Nota única de prontidão operacional atualizada em tempo real.

---

## 🏁 Roadmap do Módulo DHO

1.  [x] **Fase 1**: Infraestrutura Base (Auth, Org, RLS)
2.  [x] **Fase 2**: Gestão de Cargos e Estrutura de Carreira
3.  [x] **Fase 3**: Onboarding e Timeline
4.  [x] **Fase 4**: Ritos de Liderança e Ciclos de Feedback
5.  [x] **Fase 5**: Scorecard DHO e Alertas Preventivos
6.  [x] **Fase 6**: Avaliação de Desempenho (RUA + SMART)
7.  [x] **Fase 7**: Calibração de Talentos (9-Box & Sucessão)
8.  [ ] **Fase 8**: Dashboards de Analytics de Rampagem (Próximo Passo)

---

## 💻 Instalação e Desenvolvimento

### 1. Dependências e Ambiente
```bash
npm install
cp .env.example .env.local  # Configure as chaves obrigatórias
```

### 2. Execução
```bash
npm run dev
```

### 3. Validação de Qualidade
```bash
npm run lint       # Padronização
npm run typecheck  # Tipagem rigorosa
npm run build      # Verificação de build de produção
```

---

**Jiboia - Sistema tecnicamente estável e aprovado para Operação Controlada.**