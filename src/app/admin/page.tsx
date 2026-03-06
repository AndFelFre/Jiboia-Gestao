import Link from 'next/link'

const adminModules = [
  {
    title: 'Organizações',
    description: 'Gerenciar empresas e configurações',
    href: '/admin/organizations',
    icon: '🏢',
    variant: 'blue' as const,
  },
  {
    title: 'Unidades',
    description: 'Filiais e estrutura hierárquica',
    href: '/admin/units',
    icon: '📍',
    variant: 'green' as const,
  },
  {
    title: 'Cargos',
    description: 'Posições e funções',
    href: '/admin/positions',
    icon: '💼',
    variant: 'purple' as const,
  },
  {
    title: 'Níveis',
    description: 'Escalas de carreira',
    href: '/admin/levels',
    icon: '📊',
    variant: 'orange' as const,
  },
  {
    title: 'Trilhas',
    description: 'Caminhos de desenvolvimento',
    href: '/admin/tracks',
    icon: '🛤️',
    variant: 'pink' as const,
  },
  {
    title: 'Usuários',
    description: 'Gestão de acessos',
    href: '/admin/users',
    icon: '👥',
    variant: 'indigo' as const,
  },
  {
    title: 'Auditoria',
    description: 'Logs de alterações',
    href: '/admin/audit',
    icon: '📋',
    variant: 'gray' as const,
  },
  {
    title: 'Recrutamento',
    description: 'Vagas e candidatos',
    href: '/admin/recruitment',
    icon: '🎯',
    variant: 'blue' as const,
  },
  {
    title: 'Performance',
    description: 'Avaliações e competências',
    href: '/admin/performance/evaluations',
    icon: '🚀',
    variant: 'yellow' as const,
  },
  {
    title: 'Analytics Turnover',
    description: 'Análise de rotatividade e motivos',
    href: '/admin/analytics/turnover',
    icon: '📉',
    variant: 'green' as const,
  },
  {
    title: 'Analytics Recrutamento',
    description: 'Pipeline, Funil e Time-to-Hire',
    href: '/admin/analytics/recruitment',
    icon: '📊',
    variant: 'blue' as const,
  },
  {
    title: 'Heatmap de Skills',
    description: 'Matriz tática de competências e gaps',
    href: '/admin/analytics/skills',
    icon: '🗺️',
    variant: 'purple' as const,
  },
  {
    title: 'Gamificação',
    description: 'Medalhas e Reconhecimento',
    href: '/admin/gamification',
    icon: '🏆',
    variant: 'yellow' as const,
  },
  {
    title: 'Alerta de Turnover (IA)',
    description: 'Predição de risco e engajamento',
    href: '/admin/analytics/turnover-risk',
    icon: '🧠',
    variant: 'indigo' as const,
  },
  {
    title: 'Cultura & Clima',
    description: 'Análise de engajamento e eNPS',
    href: '/admin/analytics/culture',
    icon: '🌈',
    variant: 'pink' as const,
  },
  {
    title: 'Gestão de Acessos',
    description: 'Monitorar e revogar sessões ativas',
    href: '/admin/sessions',
    icon: '🔐',
    variant: 'rose' as const,
  },
  {
    title: 'Gestão de KPIs',
    description: 'Definir indicadores globais',
    href: '/admin/kpis',
    icon: '📈',
    variant: 'blue' as const,
  },
  {
    title: 'Metas da Equipe',
    description: 'Atribuição de metas e bônus',
    href: '/admin/kpis/targets',
    icon: '⛳',
    variant: 'indigo' as const,
  },
  {
    title: 'Funil & Forecast',
    description: 'Gestão de atividades diárias',
    href: '/admin/funnel',
    icon: '🌪️',
    variant: 'orange' as const,
  },
  {
    title: 'Construtor de Relatórios',
    description: 'Crie relatórios com drag and drop',
    href: '/admin/analytics/custom',
    icon: '📊',
    variant: 'blue' as const,
  },
]

const variantStyles = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  gray: 'bg-muted text-muted-foreground',
  yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-sm text-muted-foreground mt-1">Gerencie a estrutura organizacional</p>
            </div>
            <Link
              href="/dashboard"
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              ← Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="block bg-card rounded-lg border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all p-6"
            >
              <div className="flex items-start">
                <span className={`inline-flex items-center justify-center w-12 h-12 rounded-lg text-2xl ${variantStyles[module.variant]}`}>
                  {module.icon}
                </span>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-foreground">{module.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 bg-primary/5 border border-primary/10 rounded-lg">
          <h2 className="text-lg font-semibold text-foreground mb-2">ℹ️ Primeiros Passos</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Comece criando a <strong className="text-foreground">Organização</strong> principal</li>
            <li>Adicione as <strong className="text-foreground">Unidades</strong> (filiais, departamentos)</li>
            <li>Configure os <strong className="text-foreground">Níveis</strong> da carreira</li>
            <li>Crie os <strong className="text-foreground">Cargos</strong> disponíveis</li>
            <li>Cadastre os <strong className="text-foreground">Usuários</strong> e atribua permissões</li>
          </ol>
        </div>
      </main>
    </div>
  )
}
