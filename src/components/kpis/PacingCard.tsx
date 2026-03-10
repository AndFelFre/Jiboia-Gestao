'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Target, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface PacingCardProps {
    title: string
    actual: number
    target: number
    idealToday: number
    unit?: string
    isReversed?: boolean
}

export function PacingCard({ title, actual, target, idealToday, unit = '', isReversed = false }: PacingCardProps) {
    const isAhead = isReversed ? actual <= idealToday : actual >= idealToday
    const progressTotal = (actual / target) * 100
    const progressIdeal = (idealToday / target) * 100
    const gap = idealToday - actual

    return (
        <Card className="rounded-[2.5rem] border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-6 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Status de Ritmo</p>
                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight">{title}</CardTitle>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        isAhead ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                    )}>
                        {isAhead ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isAhead ? 'Acompanhando' : 'Atrasado'}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Realizado Agora</p>
                        <p className="text-4xl font-black text-slate-900 tabular-nums">
                            {unit}{actual.toLocaleString('pt-BR')}
                        </p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Ideal para Hoje</p>
                        <p className="text-xl font-black text-slate-600 tabular-nums">
                            {unit}{idealToday.toLocaleString('pt-BR')}
                        </p>
                    </div>
                </div>

                <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                    {/* Barra Ideal (Marcador) */}
                    <div
                        className="absolute top-0 bottom-0 border-r-2 border-slate-400 z-10 opacity-40"
                        style={{ left: `${Math.min(100, progressIdeal)}%` }}
                    />
                    {/* Barra de Progresso Real */}
                    <div
                        className={cn(
                            "absolute top-0 bottom-0 rounded-full transition-all duration-1000",
                            isAhead ? "bg-emerald-500" : "bg-primary"
                        )}
                        style={{ width: `${Math.min(100, progressTotal)}%` }}
                    />
                </div>

                <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Info className="w-4 h-4 text-slate-400" />
                    <p className="text-xs font-medium text-slate-600">
                        {isAhead
                            ? `Você está ${(actual - idealToday).toFixed(1)} ${unit} acima do ritmo linear.`
                            : `Faltam ${gap.toFixed(1)} ${unit} para atingir a meta parcial de hoje.`
                        }
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
