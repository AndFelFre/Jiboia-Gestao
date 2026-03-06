'use client'

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

interface MetricData {
    definition: {
        id: string
        title: string
        target_value: number
        frequency: string
    }
    today_value: number
}

export function FunnelProgressCard({ metrics }: { metrics: MetricData[] }) {

    // Calcula o "Farol"
    function getTrafficLight(achieved: number, target: number) {
        if (target <= 0) return { percent: 100, color: 'bg-emerald-500', text: 'Sem Meta', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> }

        const rawPercent = (achieved / target) * 100
        const percent = Math.min(Math.round(rawPercent), 100)

        if (percent >= 100) {
            return { percent, color: 'bg-emerald-500', text: 'Meta Atingida!', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> }
        } else if (percent >= 75) {
            return { percent, color: 'bg-amber-400', text: 'Quase lá', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> }
        } else if (percent > 0) {
            return { percent, color: 'bg-destructive', text: 'Abaixo da Barra', icon: <XCircle className="w-4 h-4 text-destructive" /> }
        } else {
            return { percent: 0, color: 'bg-transparent', text: 'Não iniciado', icon: <XCircle className="w-4 h-4 text-muted-foreground opacity-50" /> }
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {metrics.map(m => {
                const status = getTrafficLight(m.today_value, m.definition.target_value)

                return (
                    <div key={m.definition.id} className="relative group">
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-2">
                                {status.icon}
                                <div>
                                    <h4 className="font-bold text-sm text-foreground">{m.definition.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">{status.text}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-bold text-foreground">
                                    {m.today_value}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground">
                                    {' '} / {m.definition.target_value}
                                </span>
                            </div>
                        </div>

                        {/* Barra Track */}
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                            {/* Barra Preenchimento */}
                            <div
                                className={`h-full ${status.percent === 0 ? 'bg-transparent' : status.color} transition-all duration-1000 ease-out relative`}
                                style={{ width: `${status.percent}%` }}
                            >
                                {status.percent >= 100 && (
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
