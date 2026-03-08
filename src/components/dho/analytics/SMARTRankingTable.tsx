'use client'

import { PerformanceOrgAnalytics } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Trophy, Users, Target } from 'lucide-react'

interface SMARTRankingTableProps {
    data: PerformanceOrgAnalytics[]
}

export function SMARTRankingTable({ data }: SMARTRankingTableProps) {
    // 1. Filtrar o último período e ordenar por taxa de conversão SMART
    const latestPeriod = data.length > 0 ? data[0].period : null
    const currentData = data
        .filter(d => d.period === latestPeriod)
        .sort((a, b) => b.smart_conversion_rate - a.smart_conversion_rate)

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Ranking de Produtividade SMART
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-900/30 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4">Posição</th>
                                <th className="px-6 py-4">Unidade / Time</th>
                                <th className="px-6 py-4 text-center">Amostra</th>
                                <th className="px-6 py-4 text-right">Taxa SMART</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {currentData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                                        Nenhum dado de ranking disponível.
                                    </td>
                                </tr>
                            ) : (
                                currentData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-amber-100 text-amber-600' :
                                                    idx === 1 ? 'bg-slate-200 text-slate-600' :
                                                        idx === 2 ? 'bg-orange-100 text-orange-600' :
                                                            'bg-slate-100 text-slate-400'
                                                }`}>
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                                            {row.unit_id.substring(0, 10)}...
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                                                <Users className="w-3.5 h-3.5" />
                                                {row.sample_size}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className={`text-sm font-black ${row.smart_conversion_rate >= 80 ? 'text-emerald-500' :
                                                        row.smart_conversion_rate >= 50 ? 'text-amber-500' : 'text-rose-500'
                                                    }`}>
                                                    {row.smart_conversion_rate.toFixed(1)}%
                                                </span>
                                                <Target className={`w-4 h-4 ${row.smart_conversion_rate >= 80 ? 'text-emerald-500/20' :
                                                        row.smart_conversion_rate >= 50 ? 'text-amber-500/20' : 'text-rose-500/20'
                                                    }`} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
