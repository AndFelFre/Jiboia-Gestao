'use client'

import React from 'react'
import {
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    Target,
    Activity,
    Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { DHOScorecard } from '@/app/admin/actions/dho-scorecard'

interface DHOScorecardViewProps {
    scorecard: DHOScorecard
}

const STATUS_CONFIG = {
    high: {
        label: 'Aderência Alta',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 border-emerald-100',
        progressColor: 'bg-emerald-500'
    },
    medium: {
        label: 'Aderência Média',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-100',
        progressColor: 'bg-amber-500'
    },
    low: {
        label: 'Baixa Aderência DHO',
        color: 'text-rose-600',
        bgColor: 'bg-rose-50 border-rose-100',
        progressColor: 'bg-rose-500'
    }
}

export function DHOScorecardView({ scorecard }: DHOScorecardViewProps) {
    const config = STATUS_CONFIG[scorecard.status]

    return (
        <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 pb-4 h-24 flex flex-row items-center justify-between bg-slate-50/30">
                <div>
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-500" />
                            Scorecard DHO
                        </CardTitle>
                        <Badge variant="secondary" className="text-[9px] font-bold uppercase h-4 px-1.5 bg-indigo-50 text-indigo-600 border-indigo-100">
                            MTD
                        </Badge>
                    </div>
                    <CardDescription className="text-xs font-medium text-slate-500">
                        Fase: <span className="text-slate-700 font-bold">{scorecard.phaseLabel}</span>
                    </CardDescription>
                </div>
                <div className="flex flex-col items-end">
                    <span className={cn("text-3xl font-black tabular-nums tracking-tighter", config.color)}>
                        {scorecard.overallScore}%
                    </span>
                    <Badge variant="outline" className={cn("text-[10px] h-4 font-black uppercase py-0 px-2 mt-1", config.bgColor, config.color)}>
                        {config.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-6">
                    {/* Progress Bar Principal */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
                            <span>Mês Atual</span>
                            <span>Meta: 85%</span>
                        </div>
                        <Progress value={scorecard.overallScore} className="h-3 bg-slate-100" />
                    </div>

                    {/* Componentes do Score */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Onboarding */}
                        <div className={cn(
                            "flex flex-col p-3 rounded-xl border transition-colors",
                            scorecard.weights.onboarding > 0 ? "bg-slate-50 border-slate-100" : "bg-slate-50/30 border-slate-50 opacity-40"
                        )}>
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-tight">Onboarding</span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-lg font-black text-slate-800">
                                    {scorecard.components.onboarding !== null ? `${scorecard.components.onboarding}%` : '--'}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 italic">Peso: {Math.round(scorecard.weights.onboarding)}%</span>
                            </div>
                        </div>

                        {/* Ritos */}
                        <div className={cn(
                            "flex flex-col p-3 rounded-xl border transition-colors",
                            scorecard.weights.rites > 0 ? "bg-slate-50 border-slate-100" : "bg-slate-50/30 border-slate-50 opacity-40"
                        )}>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-tight">Ritos</span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-lg font-black text-slate-800">
                                    {scorecard.components.rites !== null ? `${Math.round(scorecard.components.rites)}%` : '--'}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 italic">Peso: {Math.round(scorecard.weights.rites)}%</span>
                            </div>
                        </div>

                        {/* KPIs */}
                        <div className={cn(
                            "flex flex-col p-3 rounded-xl border transition-colors",
                            scorecard.weights.kpis > 0 ? "bg-slate-50 border-slate-100" : "bg-slate-50/30 border-slate-50 opacity-40"
                        )}>
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-tight">KPIs (MTD)</span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-lg font-black text-slate-800">
                                    {scorecard.components.kpis !== null ? `${Math.round(scorecard.components.kpis)}%` : '--'}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 italic">Peso: {Math.round(scorecard.weights.kpis)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-tight bg-slate-50 p-2 rounded-lg border border-dashed border-slate-200 cursor-help flex items-center gap-1.5">
                                        <Info className="w-3 h-3" />
                                        <span>Cálculo derivado baseado em {scorecard.daysInPosition} dias de cargo. Pesos rebalanceados por disponibilidade de dados.</span>
                                    </p>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs text-[10px] font-medium leading-relaxed bg-slate-900 text-white border-none p-3">
                                    A nota é recalculada em tempo real (MTD). A meta de ritos é proporcional ao dia atual do mês para evitar distorções.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
