'use client'

import { PerformanceOrgAnalytics } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Target, CheckCircle2, AlertCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface SMARTConversionFunnelProps {
    data: PerformanceOrgAnalytics[]
}

export function SMARTConversionFunnel({ data }: SMARTConversionFunnelProps) {
    // 1. Filtrar o último período disponível
    const latestPeriod = data.length > 0 ? data[0].period : null
    const currentData = data.filter(d => d.period === latestPeriod)

    // Média global de conversão da Org (Ponderada pelo tamanho da amostra)
    const totalSample = currentData.reduce((acc, curr) => acc + curr.sample_size, 0)
    const globalConversion = totalSample > 0
        ? currentData.reduce((acc, curr) => acc + (curr.smart_conversion_rate * curr.sample_size), 0) / totalSample
        : 0

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden h-full">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500" />
                    Conversão de Metas SMART
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-8">
                    {/* Resumo Global */}
                    <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                        <div className="space-y-1">
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Eficiência Geral</span>
                            <h2 className="text-3xl font-black text-emerald-900 dark:text-emerald-300">{(globalConversion * 100).toFixed(1)}%</h2>
                        </div>
                        <div className="w-12 h-12 bg-white dark:bg-emerald-500/20 rounded-full flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>

                    {/* Funil por Unidade */}
                    <div className="space-y-5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Performance por Unidade</h4>

                        {currentData.length === 0 ? (
                            <div className="py-4 text-center text-slate-400 text-sm">Sem dados disponíveis.</div>
                        ) : (
                            currentData.map((row, idx) => (
                                <div key={idx} className="space-y-2 group">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                                Unidade: {row.unit_id.substring(0, 8)}...
                                            </span>
                                            {row.smart_conversion_rate < 0.5 && (
                                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                                            )}
                                        </div>
                                        <span className="font-black text-slate-900 dark:text-white">
                                            {(row.smart_conversion_rate * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-700 ${row.smart_conversion_rate >= 0.7 ? 'bg-emerald-500' :
                                                    row.smart_conversion_rate >= 0.4 ? 'bg-yellow-400' : 'bg-rose-500'
                                                }`}
                                            style={{ width: `${row.smart_conversion_rate * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Nota de rodapé */}
                    <p className="text-[10px] text-slate-400 italic">
                        * A taxa de conversão considera o número de itens de PDI da categoria "smart_goal" marcados como "Concluídos" em relação ao total planejado no ciclo aberto/fechado.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
