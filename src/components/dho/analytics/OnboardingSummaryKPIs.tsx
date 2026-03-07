'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Activity, Clock, AlertCircle, Users } from 'lucide-react'

interface SummaryKPIsProps {
    total: number
    onTrack: number
    lagging: number
    avgProgress: number
}

export function OnboardingSummaryKPIs({ total, onTrack, lagging, avgProgress }: SummaryKPIsProps) {
    const rampUpHealth = total > 0 ? Math.round((onTrack / total) * 100) : 0

    const kpis = [
        {
            title: 'Rampagem Saudável',
            value: `${rampUpHealth}%`,
            description: 'Colaboradores on-track ou acima',
            icon: Activity,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        },
        {
            title: 'Em Rampagem',
            value: total.toString(),
            description: 'Colaboradores (<= 120 dias)',
            icon: Users,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50'
        },
        {
            title: 'Atrasados (Lagging)',
            value: lagging.toString(),
            description: 'Abaixo da régua de maturidade',
            icon: AlertCircle,
            color: lagging > 0 ? 'text-rose-500' : 'text-slate-400',
            bg: lagging > 0 ? 'bg-rose-50' : 'bg-slate-50'
        },
        {
            title: 'Progresso Médio',
            value: `${avgProgress}%`,
            description: 'Média global de conclusão',
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-50'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => {
                const Icon = kpi.icon
                return (
                    <Card key={idx} className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg}`}>
                                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">{kpi.description}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
