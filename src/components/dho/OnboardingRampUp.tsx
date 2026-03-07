'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RampUpMetrics } from '@/app/admin/actions/dho-onboarding'
import { CheckCircle, Clock, AlertTriangle, Target, Activity } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface OnboardingRampUpProps {
    metrics?: RampUpMetrics | null
}

export function OnboardingRampUp({ metrics }: OnboardingRampUpProps) {
    if (!metrics || metrics.totalItems === 0) {
        return (
            <Card className="border-slate-200 shadow-sm rounded-2xl">
                <CardContent className="p-8 text-center text-slate-500 flex flex-col items-center">
                    <Target className="w-10 h-10 opacity-20 mb-3" />
                    <p className="text-sm font-medium">Nenhum onboarding ativo para este colaborador.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        Rampagem 30/60/90
                    </CardTitle>
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                        <span className="text-xs font-bold text-indigo-600">
                            {metrics.completionPercentage}% Concluído
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">

                {/* Global Progress */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                        <span>Progresso Global</span>
                        <span>{metrics.completedItems} / {metrics.totalItems} entregas</span>
                    </div>
                    <Progress value={metrics.completionPercentage} className="h-2 bg-slate-100" indicatorClassName="bg-indigo-500" />
                </div>

                {/* Phases */}
                <div className="space-y-4">
                    {metrics.phases.map((phase, idx) => {

                        let statusConfig = { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' }

                        if (phase.status === 'completed') {
                            statusConfig = { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' }
                        } else if (phase.status === 'lagging') {
                            statusConfig = { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' }
                        } else if (phase.status === 'on_track') {
                            statusConfig = { icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' }
                        }

                        const Icon = statusConfig.icon

                        return (
                            <div key={idx} className={`p-4 rounded-xl border ${statusConfig.border} flex items-center gap-4 transition-all hover:shadow-sm`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${statusConfig.bg}`}>
                                    <Icon className={`w-5 h-5 ${statusConfig.color}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-sm font-bold text-slate-800">{phase.name}</h4>
                                        <span className={`text-xs font-bold ${statusConfig.color}`}>
                                            {phase.percentage}%
                                        </span>
                                    </div>
                                    <Progress value={phase.percentage} className="h-1.5 bg-slate-100" indicatorClassName={statusConfig.bg.replace('bg-', 'bg-').replace('50', '500')} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
