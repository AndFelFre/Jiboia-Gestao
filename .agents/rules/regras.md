---
trigger: always_on
---

1. Stack e Arquitetura Padrão

Core: Next.js (App Router), TypeScript, Supabase (Postgres) e Vercel.

Componentes: Priorize React Server Components (RSC) para data-fetching. Use Client Components estritamente quando interatividade for exigida.

Dados: Utilize exclusivamente o cliente oficial do Supabase. Favoreça buscas no servidor e aproveite as camadas de cache do Next.js.

Reaproveitamento: Inspecione o codebase antes de criar. Reutilize rotas de API, hooks, middlewares, cookies de sessão e utilitários existentes em vez de inventar implementações paralelas.

2. Lógica de Domínio e KPIs (Crítico)

Precisão Matemática: O sistema gerencia operações comerciais e dashboards de vendas. Toda lógica de KPI, funil e métricas deve ser determinística, auditável e numericamente precisa.

Centralização: Cálculos e regras de negócio financeiras/comerciais devem ser centralizados. Nunca duplique fórmulas entre cliente e servidor ou entre múltiplos componentes.

Consistência de Tempo: Ao lidar com painéis de vendedores, use intervalos de datas explícitos e períodos de agregação consistentes.

3. Segurança, RLS e Controle de Acesso

Isolamento de Dados: Respeite rigorosamente os limites da organização (orgId) e o RBAC (papéis esperados: ADMIN, MANAGER, USER). O nível USER vê apenas os próprios dados.

Row Level Security (RLS): Confie e respeite as políticas de RLS do Supabase. Nunca tente contornar a segurança do banco de dados na camada de aplicação.

Privacidade: Nunca exponha chaves service-role, variáveis sensíveis ou dados pessoalmente identificáveis (PII) em código client-side, logs ou comentários.

4. Interface, UX e Acessibilidade

Estética Profissional: O foco é produtividade operacional. Mantenha a UI limpa, responsiva e prática. Evite overengineering visual (sem excesso de gradientes ou animações desnecessárias).

Design System: Siga o padrão de estilo atual do projeto (ex: Tailwind CSS, shadcn/ui, design tokens existentes). Não introduza novas bibliotecas de UI sem permissão explícita.

Acessibilidade Absoluta: Preservação de contraste, estados de foco legíveis e navegação por teclado são requisitos obrigatórios, não opcionais.

5. Execução de Tarefas e Modificações

Segurança de Infraestrutura: Nunca modifique o schema do banco de dados, fluxos de autenticação, CI/CD ou arquivos de configuração de deploy (como .vercel) a menos que explicitamente ordenado.

Resolução de Bugs: Identifique e corrija a causa raiz. Não aplique "remendos" cosméticos (polyfills de UI ou enfraquecimento de tipagem) para esconder problemas de runtime.

Validação: Para cada alteração significativa, declare claramente o que foi feito e forneça os passos de validação técnica (como testar).

Ausência de Informação: Se faltar contexto, assuma o caminho mais seguro e fundamentado no código atual. Declare sua suposição claramente antes de prosseguir.