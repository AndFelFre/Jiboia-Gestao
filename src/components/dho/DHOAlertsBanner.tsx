'use client'

import React from 'react'
import { AlertTriangle, Info, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DHOAlert } from '@/app/admin/actions/dho-alerts'

interface DHOAlertsBannerProps {
    alerts: DHOAlert[]
}

export function DHOAlertsBanner({ alerts }: DHOAlertsBannerProps) {
    if (alerts.length === 0) return null

    const redAlerts = alerts.filter(a => a.level === 'red')
    const yellowAlerts = alerts.filter(a => a.level === 'yellow')

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Radar de Gestão DHO</h3>
                        <p className="text-[10px] font-medium text-slate-500">Alertas derivados de ritos, rampagem e performance.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {redAlerts.length > 0 && (
                        <Badge variant="destructive" className="bg-rose-500 text-white border-none font-bold tabular-nums">
                            {redAlerts.length} Críticos
                        </Badge>
                    )}
                    {yellowAlerts.length > 0 && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 font-bold tabular-nums">
                            {yellowAlerts.length} Atenção
                        </Badge>
                    )}
                </div>
            </div>

            <div className="divide-y divide-slate-50 max-h-[240px] overflow-y-auto">
                {alerts.map((alert, idx) => (
                    <div key={`${alert.userId}-${alert.type}-${idx}`} className="p-3 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-1.5 h-8 rounded-full",
                                alert.level === 'red' ? "bg-rose-500" : "bg-amber-400"
                            )} />
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">{alert.userName}</p>
                                <p className="text-xs font-bold text-slate-700">{alert.message}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={
                                    alert.type === 'onboarding_stagnated' ? '/admin/analytics#engagement' :
                                        alert.type === 'score_low' ? '/admin/analytics#results' :
                                            (alert.type === 'rite_overdue' || alert.type === 'no_recent_rite') ? '/admin/performance/evaluations' :
                                                `/admin/users/${alert.userId}`
                                }
                                className="p-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg transition-all"
                            >
                                Analisar Gaps
                            </Link>
                            <Link
                                href={`/admin/users/${alert.userId}`}
                                className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
                                title="Ver Perfil Completo"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-2 bg-slate-50/30 border-t border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight text-center flex items-center justify-center gap-1">
                    <Info className="w-3 h-3" />
                    Alertas gerados automaticamente. Requerem verificação operacional.
                </p>
            </div>
        </div>
    )
}
