'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { Users, UserMinus, TrendingDown, Clock, AlertTriangle, FileText, Table } from 'lucide-react'
import { getTurnoverStats, type TurnoverStats } from '@/app/admin/actions/analytics'
import { exportToPDF, exportToXLSX } from '@/lib/utils/export'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6']

export default function TurnoverPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<TurnoverStats | null>(null)

    useEffect(() => {
        loadStats()
    }, [])

    async function loadStats() {
        const res = await getTurnoverStats()
        if (res.success && res.data) {
            setStats(res.data)
        }
        setLoading(false)
    }

    const handleExportPDF = () => {
        if (!stats) return

        const columns = [
            { header: 'Métrica', dataKey: 'metric' },
            { header: 'Valor', dataKey: 'value' }
        ]

        const data = [
            { metric: 'Total de Usuários', value: stats.currentTotal },
            { metric: 'Colaboradores Ativos', value: stats.activeTotal },
            { metric: 'Desligados no Período', value: stats.terminatedTotal },
            { metric: 'Taxa de Turnover (Anual)', value: `${stats.turnoverRate}%` },
        ]

        // Adicionar motivos
        stats.byReason.forEach(r => {
            data.push({ metric: `Motivo: ${r.reason}`, value: r.count })
        })

        exportToPDF('relatorio-turnover', 'Relatório Executivo de Turnover', columns, data)
    }

    const handleExportExcel = () => {
        if (!stats) return

        const data = [
            { Categoria: 'Geral', Métrica: 'Total de Usuários', Valor: stats.currentTotal },
            { Categoria: 'Geral', Métrica: 'Colaboradores Ativos', Valor: stats.activeTotal },
            { Categoria: 'Geral', Métrica: 'Desligados no Período', Valor: stats.terminatedTotal },
            { Categoria: 'Geral', Métrica: 'Taxa de Turnover (Anual)', Valor: `${stats.turnoverRate}%` },
        ]

        stats.byReason.forEach(r => {
            data.push({ Categoria: 'Motivos', Métrica: r.reason, Valor: r.count })
        })

        exportToXLSX('dados-turnover', data)
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
            <TrendingDown className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-sm font-black text-slate-400 animate-pulse uppercase tracking-[0.3em]">Calculando KPIs Estratégicos...</p>
        </div>
    )

    const reasonData = stats?.byReason.map(r => ({ name: r.reason, value: r.count }))
    const typeData = stats?.byType.map(t => ({ name: t.type, value: t.count }))

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <TrendingDown className="w-10 h-10 text-primary" />
                        Turnover & Analytics
                    </h1>
                    <p className="text-slate-400 mt-2 uppercase text-xs font-black tracking-[0.2em]">Monitoramento de Retenção e Capital Intelectual</p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <Button
                        variant="ghost"
                        className="rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-900 hover:text-white gap-3 h-12 px-6 font-black uppercase tracking-widest text-[10px] transition-all"
                        onClick={handleExportPDF}
                    >
                        <FileText className="w-4 h-4 text-red-500 group-hover:text-white" /> PDF
                    </Button>
                    <Button
                        variant="ghost"
                        className="rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-900 hover:text-white gap-3 h-12 px-6 font-black uppercase tracking-widest text-[10px] transition-all"
                        onClick={handleExportExcel}
                    >
                        <Table className="w-4 h-4 text-emerald-500 group-hover:text-white" /> Excel
                    </Button>
                </div>
            </header>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Ativos', value: stats?.activeTotal, icon: Users, color: 'indigo', sub: 'Colaboradores atuais' },
                    { label: 'Desligados', value: stats?.terminatedTotal, icon: UserMinus, color: 'rose', sub: 'Total no período' },
                    { label: 'Taxa Anual', value: `${stats?.turnoverRate}%`, icon: TrendingDown, color: 'orange', sub: 'Índice de rotatividade', progress: stats?.turnoverRate },
                    { label: 'Time To Hire', value: '24d', icon: Clock, color: 'blue', sub: 'Média de fechamento' }
                ].map((kpi, idx) => (
                    <Card key={idx} className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 hover:shadow-xl transition-all duration-500 group overflow-hidden border-b-4 hover:border-b-primary">
                        <div className="flex items-center justify-between mb-6">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                kpi.color === 'indigo' ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white" :
                                    kpi.color === 'rose' ? "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white" :
                                        kpi.color === 'orange' ? "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white" :
                                            "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                            )}>
                                <kpi.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-2">{kpi.value}</h3>
                        <p className="text-xs font-medium text-slate-400">{kpi.sub}</p>
                        {kpi.progress !== undefined && (
                            <Progress value={kpi.progress} className="h-1.5 mt-6 bg-slate-50" />
                        )}
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm bg-white rounded-[3rem] overflow-hidden p-10">
                    <CardHeader className="px-0 pt-0 pb-8 border-b border-slate-50 mb-8">
                        <CardTitle className="text-xl font-black text-slate-900">Motivos de Desligamento</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">Principais causas detectadas em entrevistas de saída.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] p-0">
                        {reasonData && reasonData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={reasonData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {reasonData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium italic bg-slate-50 rounded-[2rem]">
                                Sem dados suficientes para gerar insights.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white rounded-[3rem] overflow-hidden p-10">
                    <CardHeader className="px-0 pt-0 pb-8 border-b border-slate-50 mb-8">
                        <CardTitle className="text-xl font-black text-slate-900">Iniciativa de Saída</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">Proporção entre pedidos de demissão e dispensas.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] p-0">
                        {typeData && typeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={typeData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 12, 12, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium italic bg-slate-50 rounded-[2rem]">
                                Aguardando registro de movimentações.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* AI Insight Card */}
            <div className="relative p-10 bg-slate-900 rounded-[3rem] text-white overflow-hidden shadow-2xl shadow-slate-900/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mt-24 -mr-24 animate-pulse"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-20 h-20 bg-primary/20 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center border border-primary/30 shrink-0 shadow-lg shadow-primary/20">
                        <AlertTriangle className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-2xl font-black mb-3">Análise de Impacto Financeiro</h4>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-3xl">
                            O turnover de <span className="text-white font-bold">{stats?.turnoverRate}%</span> representa uma perda estimada de capital intelectual de <span className="text-primary font-bold">R$ {((stats?.terminatedTotal || 0) * 15000).toLocaleString('pt-BR')}</span>.
                            Recomendamos intensificar os planos de <span className="underline decoration-primary underline-offset-4">PDI e Mentoria</span> para os times com maior risco detectado.
                        </p>
                    </div>
                    <Button asChild className="rounded-2xl h-14 px-8 bg-primary hover:bg-white hover:text-slate-900 transition-all font-black uppercase tracking-widest text-[10px]">
                        <Link href="/admin/analytics/turnover-risk">Ver Alertas de Risco</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
