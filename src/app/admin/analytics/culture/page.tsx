'use client'

import { useEffect, useState } from 'react'
import { getPulseClimateStats, PulseClimateStats } from '../../actions/analytics'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import {
    BarChart3,
    Smile,
    Users,
    Activity,
    TrendingUp,
    AlertCircle,
    HeartPulse,
    MessagesSquare
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export default function AdminClimatePage() {
    const [stats, setStats] = useState<PulseClimateStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const res = await getPulseClimateStats()
        if (res.success && res.data) {
            setStats(res.data)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
                <div className="h-48 bg-slate-100 rounded-[2.5rem]" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-slate-100 rounded-[2rem]" />
                    <div className="h-32 bg-slate-100 rounded-[2rem]" />
                    <div className="h-32 bg-slate-100 rounded-[2rem]" />
                </div>
            </div>
        )
    }

    if (!stats) return null

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="bg-slate-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
                                <HeartPulse className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">Cultura & Clima</h1>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">People Analytics v1.0</p>
                            </div>
                        </div>
                        <p className="max-w-xl text-slate-300">
                            Monitoramento em tempo real do engajamento e satisfação dos colaboradores através de metodologias ágeis de feedback (Pulse Surveys).
                        </p>
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="text-5xl font-black text-white">{stats.eNPS}</div>
                        <div className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mt-1">Employee Net Promoter Score</div>
                    </div>
                </div>
            </header>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                            <Smile className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Satisfação Média</span>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-slate-900">{stats.averageScore} / 5</div>
                        <Progress value={(stats.averageScore / 5) * 100} className="h-1.5 mt-3" />
                    </div>
                </Card>

                <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                            <MessagesSquare className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amostragem</span>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-slate-900">{stats.totalResponses}</div>
                        <p className="text-xs text-slate-400 mt-1 font-bold italic">Respostas individuais coletadas</p>
                    </div>
                </Card>

                <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">eNPS Geral</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="text-3xl font-black text-slate-900">{stats.eNPS}</div>
                        <Badge className={`mb-1 font-bold ${stats.eNPS > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                            {stats.eNPS > 50 ? 'Excelente' : 'Bom'}
                        </Badge>
                    </div>
                </Card>
            </div>

            {/* Análise por Categoria */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <CardTitle className="text-xl font-black flex items-center gap-3">
                            <BarChart3 className="w-6 h-6 text-primary" />
                            Sentimento por Categoria
                        </CardTitle>
                        <CardDescription>Detalhamento da percepção sobre os pilares da organização.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {stats.byCategory.map((cat, idx) => (
                            <div key={idx} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-slate-900 capitalize text-sm">{cat.category}</span>
                                    <span className="text-xs font-black text-slate-400">{cat.average} / 5.0</span>
                                </div>
                                <Progress
                                    value={(cat.average / 5) * 100}
                                    className={`h-2.5 rounded-full ${cat.average >= 4 ? '[&>div]:bg-emerald-500' :
                                        cat.average >= 3 ? '[&>div]:bg-amber-500' : '[&>div]:bg-rose-500'
                                        }`}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-50 overflow-hidden border-2 border-dashed border-slate-200">
                    <CardContent className="p-12 flex flex-col items-center justify-center h-full text-center space-y-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-white shadow-lg flex items-center justify-center">
                            <Activity className="w-10 h-10 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-800">IA Insights em Breve</h3>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                No próximo ciclo, nossa IA correlacionará estes dados com **Produtividade** e **Gaps de Skills** para prever o clima futuro.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
