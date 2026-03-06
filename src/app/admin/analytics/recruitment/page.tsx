'use client'

import { useEffect, useState } from 'react'
import { getRecruitmentStats, RecruitmentStats } from '../../actions/analytics'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, LabelList, AreaChart, Area
} from 'recharts'
import {
    Users, Clock, TrendingUp, Filter, ArrowRight, ArrowLeft,
    Calendar, Download, RefreshCcw, Search, ChevronRight, Sparkles, FileText, Table
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { exportToPDF, exportToXLSX } from '@/lib/utils/export'

export default function RecruitmentAnalyticsPage() {
    const [stats, setStats] = useState<RecruitmentStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const handleExportPDF = () => {
        if (!stats) return
        const columns = [
            { header: 'Etapa/Métrica', dataKey: 'label' },
            { header: 'Valor', dataKey: 'count' }
        ]

        // Mapear funnel explicitamente para evitar conflito de tipos
        const data: any[] = stats.funnel.map(f => ({ label: f.label, count: f.count }))

        // Adicionar métricas gerais
        data.push({ label: '------------------', count: '----------' })
        data.push({ label: 'Total de Candidatos', count: stats.totalCandidates.toString() })
        data.push({ label: 'Média Time-to-Hire', count: `${stats.timeToHireAvg} dias` })

        exportToPDF('relatorio-recrutamento', 'Análise de Pipeline e Funil', columns, data)
    }

    const handleExportExcel = () => {
        if (!stats) return
        const data: any[] = stats.funnel.map(f => ({
            Etapa: f.label,
            Candidatos: f.count
        }))

        data.push({ Etapa: 'TOTAL ACUMULADO', Candidatos: stats.totalCandidates })
        data.push({ Etapa: 'TIME-TO-HIRE MÉDIO', Candidatos: `${stats.timeToHireAvg} dias` })

        exportToXLSX('dados-recrutamento', data)
    }

    useEffect(() => {
        loadStats()
    }, [])

    async function loadStats() {
        setLoading(true)
        const result = await getRecruitmentStats()
        if (result.success && result.data) {
            setStats(result.data)
        } else {
            setError(result.error || 'Erro ao carregar dados')
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
                <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Consolidando dados do pipeline...</p>
            </div>
        )
    }

    if (error || !stats) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-3xl m-8 border border-red-100">
                <p className="text-red-600 font-bold mb-4">{error || 'Dados não disponíveis'}</p>
                <Button onClick={loadStats} variant="outline" className="rounded-full">Tentar novamente</Button>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-2xl">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Filter className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Pipeline Analytics</h1>
                    </div>
                    <p className="text-muted-foreground">Monitoramento de eficiência do funil de recrutamento.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="rounded-2xl border-slate-200 hover:bg-slate-50 gap-2 h-12 px-4"
                            onClick={handleExportPDF}
                        >
                            <FileText className="w-4 h-4 text-red-500" /> PDF
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-2xl border-slate-200 hover:bg-slate-50 gap-2 h-12 px-4"
                            onClick={handleExportExcel}
                        >
                            <Table className="w-4 h-4 text-emerald-500" /> Excel
                        </Button>
                    </div>
                    <Button variant="default" className="rounded-2xl shadow-lg shadow-primary/20 gap-2 h-12 px-6">
                        <Calendar className="w-4 h-4" /> Últimos 12 meses
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2rem] overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-100/70 font-bold uppercase tracking-widest text-[10px]">Total de Candidatos</CardDescription>
                        <CardTitle className="text-4xl font-black">{stats.totalCandidates}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-blue-100 text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>Fluxo acumulado no período</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-emerald-500 text-white rounded-[2rem] overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
                    <CardHeader className="pb-2">
                        <CardDescription className="text-emerald-50/70 font-bold uppercase tracking-widest text-[10px]">Time-to-Hire</CardDescription>
                        <CardTitle className="text-4xl font-black">{stats.timeToHireAvg} <span className="text-lg font-medium opacity-70">dias</span></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-emerald-50 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Média de velocidade da contratação</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2rem] overflow-hidden group">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-8 -mb-8 blur-2xl group-hover:bg-primary/30 transition-all" />
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Contratações (Hired)</CardDescription>
                        <CardTitle className="text-4xl font-black">{stats.totalHired}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span>Sucessos registrados no funil</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico do Funil */}
                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="pb-0 border-b border-slate-50 p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-indigo-500" />
                                    Visualização do Funil
                                </CardTitle>
                                <CardDescription>Distribuição de candidatos por etapa.</CardDescription>
                            </div>
                            <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-600 border-none font-bold">
                                Live View
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={stats.funnel}
                                    margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="label"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                        width={100}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={28}>
                                        {stats.funnel.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={`hsl(var(--primary) / ${1 - (index * 0.1)})`}
                                            />
                                        ))}
                                        <LabelList dataKey="count" position="right" style={{ fill: '#334155', fontWeight: 800, fontSize: 13 }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Taxas de Conversão */}
                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-50 overflow-hidden">
                    <CardHeader className="pb-0 border-b border-white p-8 bg-white/40">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Taxas de Conversão
                        </CardTitle>
                        <CardDescription>Eficiência de passagem entre cada degrau do funil.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4 max-h-[460px] overflow-y-auto custom-scrollbar">
                        {stats.conversionRates.map((c, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 group hover:border-primary/50 transition-all">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.from}</span>
                                        <ChevronRight className="w-3 h-3 text-slate-300" />
                                        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tighter">{c.to}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-full transition-all duration-1000 group-hover:bg-primary"
                                            style={{ width: `${c.rate}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-black text-slate-900">{c.rate}%</span>
                                </div>
                            </div>
                        ))}

                        {stats.conversionRates.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                <Search className="w-10 h-10 mb-2" />
                                <p className="text-sm font-bold">Sem dados de conversão</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* CTA Final */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500 rounded-full blur-[120px]" />
                    <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-500 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-white mb-2">Gargalos identificados?</h2>
                    <p className="text-slate-400">Analise as vagas individualmente para entender o tempo de SLA.</p>
                </div>
                <Button asChild className="relative z-10 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-14 px-8 font-bold shadow-xl">
                    <Link href="/admin/recruitment/jobs" className="flex items-center gap-2">
                        Verificar Vagas <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
            </div>
        </div>
    )
}
