'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { Users, UserMinus, TrendingDown, Clock, AlertTriangle, Download, FileText, Table } from 'lucide-react'
import { getTurnoverStats, type TurnoverStats } from '@/app/admin/actions/analytics'
import { exportToPDF, exportToXLSX } from '@/lib/utils/export'
import { Button } from '@/components/ui/button'

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#6366f1']

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

    if (loading) return <div className="p-8 text-center text-primary font-bold animate-pulse">Calculando métricas estratégicas...</div>

    const reasonData = stats?.byReason.map(r => ({ name: r.reason, value: r.count }))
    const typeData = stats?.byType.map(t => ({ name: t.type, value: t.count }))

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 italic">Turnover & Analytics</h1>
                    <p className="text-muted-foreground text-sm">Monitoramento da saúde da retenção de talentos e capital de conhecimento.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-200 gap-2 h-10 px-4"
                        onClick={handleExportPDF}
                    >
                        <FileText className="w-4 h-4 text-red-500" /> PDF
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-200 gap-2 h-10 px-4"
                        onClick={handleExportExcel}
                    >
                        <Table className="w-4 h-4 text-emerald-500" /> Excel
                    </Button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-blue-50/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <span className="text-xs font-bold text-blue-600">ATIVOS</span>
                        </div>
                        <h3 className="text-2xl font-bold">{stats?.activeTotal}</h3>
                        <p className="text-[10px] text-muted-foreground">Colaboradores atuais</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-red-50/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <UserMinus className="w-5 h-5 text-red-600" />
                            <span className="text-xs font-bold text-red-600">DESLIGADOS</span>
                        </div>
                        <h3 className="text-2xl font-bold">{stats?.terminatedTotal}</h3>
                        <p className="text-[10px] text-muted-foreground">Total histórico</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-orange-50/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingDown className="w-5 h-5 text-orange-600" />
                            <span className="text-xs font-bold text-orange-600">TAXA ANUAL</span>
                        </div>
                        <h3 className="text-2xl font-bold">{stats?.turnoverRate}%</h3>
                        <Progress value={stats?.turnoverRate} className="h-1 mt-2" />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-slate-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="w-5 h-5 text-slate-600" />
                            <span className="text-xs font-bold text-slate-600">TIME TO HIRE</span>
                        </div>
                        <h3 className="text-2xl font-bold">24d</h3>
                        <p className="text-[10px] text-muted-foreground">Média de fechamento de vagas</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Distribuição por Motivo */}
                <Card className="border-none shadow-xl">
                    <CardHeader>
                        <CardTitle>Motivos de Desligamento</CardTitle>
                        <CardDescription>Principais causas de saída da empresa.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {reasonData && reasonData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={reasonData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {reasonData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic">
                                Sem dados suficientes para exibir gráfico.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tipo de Desligamento */}
                <Card className="border-none shadow-xl">
                    <CardHeader>
                        <CardTitle>Voluntário vs Involuntário</CardTitle>
                        <CardDescription>Percentual de pedidos de demissão vs desligamentos pela empresa.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {typeData && typeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={typeData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic">
                                Sem dados suficientes para exibir gráfico.
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>

            {/* Alerta de Custo */}
            <Card className="border-2 border-dashed border-red-200 bg-red-50/50">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-red-900">Perda Estimada de Knowledge Capital</h4>
                        <p className="text-sm text-red-700 mt-1 max-w-2xl">
                            Baseado no turnover acumulado de {stats?.turnoverRate}%, estimamos um custo de reintegração de aproximadamente R$ {((stats?.terminatedTotal || 0) * 15000).toLocaleString('pt-BR')} este ano.
                            Focar em planos de carreira e PDI pode reduzir este impacto.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
