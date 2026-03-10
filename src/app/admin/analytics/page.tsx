import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Users,
    BrainCircuit,
    Rocket,
    LayoutGrid,
    ArrowLeft,
    PieChart,
    ShieldAlert
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const analyticsGroups = [
    {
        label: 'Engajamento & Clima',
        description: 'Métricas de saúde organizacional e satisfação profunda.',
        items: [
            {
                title: 'Risco de Retenção',
                description: 'Análise determinística de estabilidade e risco de saída.',
                href: '/admin/analytics/retention',
                icon: ShieldAlert,
                color: 'rose'
            },
            {
                title: 'Clima & Cultura',
                description: 'Métricas de eNPS, pulso e engajamento da equipe.',
                href: '/admin/analytics/culture',
                icon: Activity,
                color: 'pink'
            },
            {
                title: 'Maturidade & Rampagem',
                description: 'Eficiência de onboarding e progresso (D90).',
                href: '/admin/analytics/onboarding',
                icon: Rocket,
                color: 'indigo'
            },
        ]
    },
    {
        label: 'Resultados & Gaps',
        description: 'Indicadores de performance técnica e movimentação de talentos.',
        items: [
            {
                title: 'Performance Organizacional',
                description: 'Heatmap de RUA e conversão SMART.',
                href: '/admin/analytics/performance',
                icon: TrendingUp,
                color: 'emerald'
            },
            {
                title: 'Turnover & Saídas',
                description: 'Monitoramento de rotatividade e desligamentos.',
                href: '/admin/analytics/turnover',
                icon: TrendingDown,
                color: 'red'
            },
            {
                title: 'Gaps de Competência',
                description: 'Mapa de calor de skills e necessidades de treinamento.',
                href: '/admin/analytics/skills',
                icon: LayoutGrid,
                color: 'violet'
            }
        ]
    }
]

export default function AnalyticsHubPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors mb-4">
                        <ArrowLeft className="w-3 h-3" /> Painel Admin
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <BarChart3 className="w-10 h-10 text-primary" />
                        Analytics Central
                    </h1>
                    <p className="text-slate-400 mt-2 uppercase text-xs font-black tracking-[0.2em]">Inteligência de Dados para Gestão de DHO</p>
                </div>
            </header>

            <div className="space-y-16">
                {analyticsGroups.map((group) => (
                    <section
                        key={group.label}
                        id={group.label.toLowerCase().includes('engajamento') ? 'engagement' : 'results'}
                        className="space-y-8 scroll-mt-32"
                    >
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-1">{group.label}</h2>
                            <p className="text-sm text-slate-400 font-medium">{group.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {group.items.map((module, idx) => {
                                const Icon = module.icon
                                return (
                                    <Card key={idx} className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 group border-b-8 border-transparent hover:border-primary/20">
                                        <Link href={module.href} className="block p-8">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-500 shadow-sm
                                                ${module.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                                                    module.color === 'rose' ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white' :
                                                        module.color === 'red' ? 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white' :
                                                            module.color === 'pink' ? 'bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white' :
                                                                module.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' :
                                                                    'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white'}
                                            `}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <CardTitle className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors mb-2">
                                                {module.title}
                                            </CardTitle>
                                            <CardDescription className="text-sm text-slate-400 font-medium leading-relaxed">
                                                {module.description}
                                            </CardDescription>
                                        </Link>
                                    </Card>
                                )
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    )
}
