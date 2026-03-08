'use client'

import { PerformanceOrgAnalytics } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine } from 'recharts'
import { Zap, Info } from 'lucide-react'

interface RampupPerformanceCorrelationProps {
    data: PerformanceOrgAnalytics[]
}

export function RampupPerformanceCorrelation({ data }: RampupPerformanceCorrelationProps) {
    // 1. Filtrar o último período disponível
    const latestPeriod = data.length > 0 ? data[0].period : null
    const currentData = data.filter(d => d.period === latestPeriod)

    // Prepara os dados para o gráfico
    const chartData = currentData.map(d => {
        const avgRua = ((d.avg_resilience || 0) + (d.avg_utility || 0) + (d.avg_ambition || 0)) / 3
        return {
            name: d.unit_id.substring(0, 6) + '...',
            rampup: d.avg_cohort_rampup_progress || 0,
            performance: parseFloat(avgRua.toFixed(2)),
            sampleSize: d.sample_size
        }
    }).sort((a, b) => b.rampup - a.rampup)

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden h-full">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-500" />
                    Correlação: Rampagem vs Performance
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                            />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                stroke="#6366f1"
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#6366f1' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#10b981"
                                domain={[0, 5]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#10b981' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                            />
                            <Legend
                                verticalAlign="top"
                                align="center"
                                wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                            />
                            <Bar yAxisId="left" dataKey="rampup" name="% Rampagem" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar yAxisId="right" dataKey="performance" name="Score RUA" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-bold italic">
                    <Info className="w-3 h-3" />
                    Analisa se unidades com integração acelerada atingem melhores níveis comportamentais.
                </div>
            </CardContent>
        </Card>
    )
}
