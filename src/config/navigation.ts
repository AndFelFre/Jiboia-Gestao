import {
    Building2,
    MapPin,
    Briefcase,
    Layers,
    GitBranch,
    Users,
    Rocket,
    Target,
    Zap,
    Flag,
    TrendingDown,
    Activity,
    Trophy,
    BrainCircuit,
    ListTodo,
    TrendingUp,
    History,
    Lock,
    LayoutGrid,
    ShieldCheck,
    Search
} from 'lucide-react'

export interface NavModule {
    title: string
    description: string
    href: string
    icon: any
    color: 'blue' | 'emerald' | 'orange' | 'purple' | 'pink' | 'indigo' | 'slate' | 'rose' | 'amber' | 'red' | 'violet' | 'yellow'
    category: 'Estrutura' | 'Talentos' | 'Performance' | 'Inteligência' | 'Segurança'
    tags: string[] // Para busca (Cmd+K)
}

export const ADMIN_MODULES: NavModule[] = [
    // --- ESTRUTURA ---
    {
        title: 'Organizações',
        description: 'Empresas e configurações globais',
        href: '/admin/organizations',
        icon: Building2,
        color: 'blue',
        category: 'Estrutura',
        tags: ['empresa', 'cliente', 'configuração', 'setup']
    },
    {
        title: 'Unidades',
        description: 'Filiais e centros de custo',
        href: '/admin/units',
        icon: MapPin,
        color: 'emerald',
        category: 'Estrutura',
        tags: ['filial', 'ponto', 'localização']
    },
    {
        title: 'Níveis',
        description: 'Estrutura e degraus de carreira',
        href: '/admin/levels',
        icon: Layers,
        color: 'orange',
        category: 'Estrutura',
        tags: ['carreira', 'hierarquia', 'cargo']
    },
    {
        title: 'Cargos',
        description: 'Posições e responsabilidades',
        href: '/admin/positions',
        icon: Briefcase,
        color: 'purple',
        category: 'Estrutura',
        tags: ['função', 'job', 'responsabilidade']
    },
    {
        title: 'Trilhas',
        description: 'Caminhos de desenvolvimento',
        href: '/admin/tracks',
        icon: GitBranch,
        color: 'pink',
        category: 'Estrutura',
        tags: ['desenvolvimento', 'training', 'pdi']
    },

    // --- TALENTOS ---
    {
        title: 'Usuários',
        description: 'Gestão de acessos e convites',
        href: '/admin/users',
        icon: Users,
        color: 'indigo',
        category: 'Talentos',
        tags: ['colaborador', 'funcionário', 'acesso', 'permissão']
    },
    {
        title: 'Recrutamento',
        description: 'Vagas e gestão de candidatos',
        href: '/admin/recruitment',
        icon: Target,
        color: 'blue',
        category: 'Talentos',
        tags: ['vaga', 'seleção', 'contratação', 'pipeline']
    },
    {
        title: 'Gamificação',
        description: 'Reconhecimento e conquistas',
        href: '/admin/gamification',
        icon: Trophy,
        color: 'yellow',
        category: 'Talentos',
        tags: ['recompensa', 'medalha', 'ponto', 'engajamento']
    },

    // --- PERFORMANCE ---
    {
        title: 'Avaliações',
        description: 'Ciclos de desempenho e 9-Box',
        href: '/admin/performance/evaluations',
        icon: Rocket,
        color: 'amber',
        category: 'Performance',
        tags: ['feedback', 'desempenho', '9-box', 'competência']
    },
    {
        title: 'KPIs Globais',
        description: 'Definir indicadores de sucesso',
        href: '/admin/kpis',
        icon: Zap,
        color: 'blue',
        category: 'Performance',
        tags: ['métrica', 'indicador', 'meta', 'sucesso']
    },
    {
        title: 'Metas da Equipe',
        description: 'Atribuição de bônus e OKRs',
        href: '/admin/kpis/targets',
        icon: Flag,
        color: 'indigo',
        category: 'Performance',
        tags: ['comissão', 'bônus', 'alcançado', 'okr']
    },
    {
        title: 'Funil Diário',
        description: 'Gestão de produtividade',
        href: '/admin/funnel',
        icon: ListTodo,
        color: 'orange',
        category: 'Performance',
        tags: ['tarefa', 'venda', 'atividade', 'crm']
    },

    // --- INTELIGÊNCIA ---
    {
        title: 'Analytics Turnover',
        description: 'Taxa de saída e retenção',
        href: '/admin/analytics/turnover',
        icon: TrendingDown,
        color: 'red',
        category: 'Inteligência',
        tags: ['saída', 'demissão', 'retenção', 'churn']
    },
    {
        title: 'Heatmap de Skills',
        description: 'Matriz tática de gaps',
        href: '/admin/analytics/skills',
        icon: Activity,
        color: 'violet',
        category: 'Inteligência',
        tags: ['habilidade', 'competência', 'treinamento', 'gap']
    },
    {
        title: 'IA Alertas (Risco)',
        description: 'Predição de desengajamento',
        href: '/admin/analytics/turnover-risk',
        icon: BrainCircuit,
        color: 'indigo',
        category: 'Inteligência',
        tags: ['predição', 'ia', 'inteligência', 'risco']
    },
    {
        title: 'Cultura & Clima',
        description: 'eNPS e engajamento',
        href: '/admin/analytics/culture',
        icon: Activity,
        color: 'pink',
        category: 'Inteligência',
        tags: ['pesquisa', 'clima', 'satisfação', 'enps']
    },
    {
        title: 'Analytics Onboarding',
        description: 'Maturidade e Rampagem (D90)',
        href: '/admin/analytics/onboarding',
        icon: Rocket,
        color: 'indigo',
        category: 'Inteligência',
        tags: ['treinamento', 'inicial', 'rampage', 'novo']
    },

    // --- SEGURANÇA ---
    {
        title: 'Auditoria',
        description: 'Rastreabilidade de alterações',
        href: '/admin/audit',
        icon: History,
        color: 'slate',
        category: 'Segurança',
        tags: ['log', 'histórico', 'alteração', 'segurança']
    },
    {
        title: 'Gestão de Acessos',
        description: 'Monitorar e revogar sessões',
        href: '/admin/sessions',
        icon: Lock,
        color: 'rose',
        category: 'Segurança',
        tags: ['login', 'dispositivo', 'sessão', 'bloqueio']
    }
]

export const SEARCHABLE_ACTIONS = [
    {
        title: 'Convidar Colaborador',
        description: 'Criar novo acesso para talento',
        href: '/admin/users/new',
        category: 'Talentos',
        tags: ['novo', 'criar', 'convite', 'user', 'contratação']
    },
    {
        title: 'Abrir Novo Ciclo',
        description: 'Iniciar avaliação 9-Box',
        href: '/admin/performance/evaluations/new',
        category: 'Performance',
        tags: ['novo', 'abrir', 'ciclo', 'avaliação']
    },
    {
        title: 'Criar Novo KPI',
        description: 'Definir novo indicador estratégico',
        href: '/admin/kpis/new',
        category: 'Performance',
        tags: ['novo', 'criar', 'meta', 'indicador']
    },
    {
        title: 'Postar Vaga',
        description: 'Abrir oportunidade no recrutamento',
        href: '/admin/recruitment/new',
        category: 'Talentos',
        tags: ['novo', 'vaga', 'postar', 'seleção']
    },
    {
        title: 'Ver Auditoria',
        description: 'Consultar logs de segurança',
        href: '/admin/audit',
        category: 'Segurança',
        tags: ['logs', 'quem', 'alteração', 'histórico']
    }
]

export const navCategories = [
    { id: 'Estrutura', label: 'Estrutura Organizacional', icon: Building2 },
    { id: 'Talentos', label: 'Gestão de Talentos', icon: Users },
    { id: 'Performance', label: 'Performance & Resultados', icon: TrendingUp },
    { id: 'Inteligência', label: 'Inteligência & Analytics', icon: BrainCircuit },
    { id: 'Segurança', label: 'Governança & Segurança', icon: ShieldCheck }
]
