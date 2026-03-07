'use client'

import { PerformanceOrgAnalytics } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TrendingUp, Users, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface PerformanceHeatmapProps {
    data: PerformanceOrgAnalytics[]
}

export function PerformanceHeatmap({ data }: PerformanceHeatmapProps) {
    // 1. Filtrar o último período disponível para o heatmap atual
    const latestPeriod = data.length > 0 ? data[0].period : null
    const currentData = data.filter(d => d.period === latestPeriod)

    // Helper para determinar a cor com base no score (1-5)
    function getScoreColor(score: number | null) {
        if (score === null) return 'bg-slate-100 text-slate-400 dark:bg-slate-800'
        if (score >= 4.5) return 'bg-emerald-500 text-white'
        if (score >= 3.5) return 'bg-emerald-400 text-white'
        if (score >= 2.5) return 'bg-yellow-400 text-slate-900'
        if (score >= 1.5) return 'bg-orange-500 text-white'
        return 'bg-rose-500 text-white'
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Mapa de Calor RUA (Agregado)
                    </CardTitle>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Período: {latestPeriod ? new Date(latestPeriod).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'N/A'}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-6">
                    {/* Header da Tabela */}
                    <div className="grid grid-cols-4 gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div>Unidade / Time</div>
                        <div className="text-center">Resiliência</div>
                        <div className="text-center">Utilidade</div>
                        <div className="text-center">Ambição</div>
                    </div>

                    {/* Linhas de Dados */}
                    <div className="space-y-3">
                        {currentData.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 text-sm italic">
                                Sem dados de fechamento para este período.
                            </div>
                        ) : (
                            currentData.map((row, idx) => (
                                <div key={idx} className="grid grid-cols-4 gap-4 items-center group">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {/* TODO: Mapear unit_id para Nome da Unidade no Dashboard Principal */}
                                            Unidade: {row.unit_id.substring(0, 8)}...
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                            <Users className="w-3 h-3" />
                                            {row.sample_size} avaliações
                                        </div>
                                    </div>

                                    {/* Eixos RUA */}
                                    {[row.avg_resilience, row.avg_utility, row.avg_ambition].map((score, sIdx) => (
                                        <div key={sIdx} className="flex justify-center">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className={`
                                                            w-12 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm transition-all
                                                            ${getScoreColor(score)}
                                                            ${score === null ? 'cursor-help border border-dashed border-slate-200 dark:border-slate-700' : 'hover:scale-105'}
                                                        `}>
                                                            {score ? score.toFixed(1) : 'N/D'}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white border-none text-xs p-2">
                                                        {score
                                                            ? `Média calculada para ${row.sample_size} colaboradores.`
                                                            : `Dados insuficientes (<3) para garantir anonimato.`
                                                        }
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Legenda */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-rose-500" /> Baixa
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-yellow-400" /> Média
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Alta
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Threshold de anonimização ativo (Min. 3)
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
