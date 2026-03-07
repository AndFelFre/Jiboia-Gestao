'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Layers } from 'lucide-react'

interface FunnelData {
    total: number
    onTrack: number
    lagging: number
}

interface OnboardingFunnelProps {
    funnel: {
        d0_30: FunnelData
        d31_60: FunnelData
        d61_90: FunnelData
        d91_120: FunnelData
    }
}

export function OnboardingFunnel({ funnel }: OnboardingFunnelProps) {
    const cohorts = [
        { label: 'D0–30 (Inicial)', data: funnel.d0_30 },
        { label: 'D31–60 (Execução)', data: funnel.d31_60 },
        { label: 'D61–90 (Maturidade)', data: funnel.d61_90 },
        { label: 'D91–120 (Operacional)', data: funnel.d91_120 }
    ]

    return (
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    Funil de Rampagem por Cohort
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-6">
                    {cohorts.map((cohort, idx) => {
                        const { total, onTrack, lagging } = cohort.data
                        const onTrackPercent = total > 0 ? Math.round((onTrack / total) * 100) : 0

                        return (
                            <div key={idx} className="group">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">{cohort.label}</h4>
                                        <p className="text-xs text-slate-400">
                                            {total} colaboradores no período
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex gap-2 items-center">
                                            <span className="text-xs font-bold text-emerald-600">{onTrack} Healthy</span>
                                            {lagging > 0 && (
                                                <span className="text-xs font-bold text-rose-500">{lagging} Lagging</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-1000"
                                        style={{ width: `${onTrackPercent}%` }}
                                    />
                                    {total > 0 && lagging > 0 && (
                                        <div
                                            className="h-full bg-rose-500 transition-all duration-1000"
                                            style={{ width: `${Math.round((lagging / total) * 100)}%` }}
                                        />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
