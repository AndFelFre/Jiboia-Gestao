'use client'

import { PerformanceOrgAnalytics } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import { History } from 'lucide-react'

interface PerformanceTrendChartProps {
    data: PerformanceOrgAnalytics[]
}

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
    // 1. Agrupar dados por período (Média da Org para cada período)
    const periods = Array.from(new Set(data.map(d => d.period))).sort()

    const chartData = periods.map(period => {
        const periodData = data.filter(d => d.period === period)
        const totalSample = periodData.reduce((acc, curr) => acc + curr.sample_size, 0)

        return {
            period: new Date(period).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            resiliencia: totalSample > 0
                ? periodData.reduce((acc, curr) => acc + ((curr.avg_resilience || 0) * curr.sample_size), 0) / totalSample
                : 0,
            utilidade: totalSample > 0
                ? periodData.reduce((acc, curr) => acc + ((curr.avg_utility || 0) * curr.sample_size), 0) / totalSample
                : 0,
            ambicao: totalSample > 0
                ? periodData.reduce((acc, curr) => acc + ((curr.avg_ambition || 0) * curr.sample_size), 0) / totalSample
                : 0
        }
    })

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden h-full">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-500" />
                    Tendência Histórica (Evolução RUA)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorAmb" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="period"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                            />
                            <YAxis
                                domain={[0, 5]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
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
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '20px' }}
                            />
                            <Area type="monotone" dataKey="resiliencia" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRes)" name="Resiliência" />
                            <Area type="monotone" dataKey="utilidade" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUtil)" name="Utilidade" />
                            <Area type="monotone" dataKey="ambicao" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorAmb)" name="Ambição" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
