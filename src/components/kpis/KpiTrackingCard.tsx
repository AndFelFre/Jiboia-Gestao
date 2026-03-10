'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TrendingUp, TrendingDown, Info, Target, Calculator } from 'lucide-react'
import { getTrafficLight, getMonthBusinessDaysInfo } from '@/lib/kpi-engine'

interface KpiTrackingCardProps {
    name: string
    targetValue: number
    actualValue: number
    achievement: number
    weight: number
    dataType: 'number' | 'percentage' | 'currency' | 'time'
    isReversed?: boolean
}

export function KpiTrackingCard({
    name,
    targetValue,
    actualValue,
    achievement,
    weight,
    dataType,
    isReversed
}: KpiTrackingCardProps) {
    const status = getTrafficLight(achievement)
    const { total, elapsed } = getMonthBusinessDaysInfo()

    // Cálculo do Forecast (Projeção Linear por Dias Úteis)
    const forecastRatio = (actualValue / elapsed) * total
    const forecastAchievement = (forecastRatio / Math.max(0.0001, targetValue)) * 100
    const forecastStatus = getTrafficLight(forecastAchievement)

    const formatValue = (val: number) => {
        if (dataType === 'percentage') return `${val.toFixed(1)}%`
        if (dataType === 'currency') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
        return val.toLocaleString('pt-BR')
    }

    const statusColors = {
        green: 'bg-emerald-500 text-white',
        yellow: 'bg-amber-500 text-white',
        red: 'bg-rose-500 text-white'
    }

    const forecastColors = {
        green: 'text-emerald-600 bg-emerald-50',
        yellow: 'text-amber-600 bg-amber-50',
        red: 'text-rose-600 bg-rose-50'
    }

    const statusBorders = {
        green: 'border-emerald-200 bg-emerald-50/50',
        yellow: 'border-amber-200 bg-amber-50/50',
        red: 'border-rose-200 bg-rose-50/50'
    }

    return (
        <Card className={`overflow-hidden transition-all hover:shadow-md border-l-4 ${status === 'green' ? 'border-l-emerald-500' : status === 'yellow' ? 'border-l-amber-500' : 'border-l-rose-500'} ${statusBorders[status]}`}>
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700">{name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter">
                                Peso: {weight.toFixed(1)}
                            </Badge>
                            {isReversed && (
                                <Badge variant="secondary" className="text-[10px] bg-indigo-100 text-indigo-700 border-none">
                                    Invertido
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColors[status]} shadow-lg`}>
                        {achievement >= 100 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <Target className="w-3 h-3" /> Meta
                        </p>
                        <p className="text-lg font-black">{formatValue(targetValue)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Realizado
                        </p>
                        <p className="text-lg font-black">{formatValue(actualValue)}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1">
                            <span className="text-2xl font-black">{achievement.toFixed(1)}%</span>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Atual</span>
                        </div>

                        {/* Forecast Badge */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className={`px-2 py-1 rounded-md flex items-center gap-1 cursor-help ${forecastColors[forecastStatus]}`}>
                                        <TrendingUp className="w-3 h-3" />
                                        <span className="text-[10px] font-black uppercase">Proj: {forecastAchievement.toFixed(0)}%</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 text-white p-3 rounded-xl border-none shadow-2xl">
                                    <p className="text-[10px] font-black uppercase mb-1">Tendência de Fechamento</p>
                                    <p className="text-xs opacity-80 leading-relaxed">
                                        No ritmo atual dos últimos **{elapsed}** dias úteis, você projeta atingir **{forecastAchievement.toFixed(1)}%** ({formatValue(forecastRatio)}) até o final do mês.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase">
                            <span>Progresso</span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                            <Calculator className="w-3 h-3" /> Ver Calculadora
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 border-none text-white p-3 rounded-xl shadow-2xl max-w-[200px]">
                                        <p className="text-[10px] uppercase font-black mb-2 flex items-center gap-1">
                                            <Info className="w-3 h-3" /> Cálculo de Impacto
                                        </p>
                                        <p className="text-xs leading-relaxed opacity-80">
                                            Impacto Final = Representa {(achievement * weight / 10).toFixed(1)}% do seu bônus/nota final.
                                        </p>
                                        <div className="mt-2 pt-2 border-t border-white/10 text-[10px] italic opacity-60">
                                            Fórmula: (Atingimento * Peso) / 10
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Progress value={Math.min(achievement, 100)} className="h-2 rounded-full bg-slate-200" indicatorClassName={statusColors[status]} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
