'use client'

import { useState, useEffect } from 'react'
import { getSkillHeatmap, type SkillHeatmapData } from '@/app/admin/actions/analytics'
import { SkillHeatmap } from '@/components/analytics/SkillHeatmap'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
    LayoutGrid,
    Info,
    AlertCircle,
    Building,
    CheckCircle2,
    Briefcase
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HeatmapActions } from '@/components/analytics/HeatmapActions'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function SkillsHeatmapPage() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<SkillHeatmapData | null>(null)
    const [error, setError] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const res = await getSkillHeatmap()
        if (res.success && res.data) {
            setData(res.data)
        } else {
            setError(res.error || 'Erro ao carregar matriz de talentos')
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
                <LayoutGrid className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm font-black text-slate-400 animate-pulse uppercase tracking-[0.3em]">Gerando Matriz de Heatmap...</p>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                <AlertCircle className="w-16 h-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black text-slate-900 mb-2">Erro de Processamento</h2>
                <p className="text-slate-400 font-medium max-w-xs">{error}</p>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header Premium de Alta Performance */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-900 text-white p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:bg-primary/30 transition-all duration-1000"></div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest">Analytics Operacional</Badge>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Matrix
                        </span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight flex items-center gap-6">
                        <LayoutGrid className="w-14 h-14 text-primary" />
                        Heatmap de Skills
                    </h1>
                    <p className="text-slate-400 max-w-xl font-medium text-lg leading-relaxed">
                        Visualize a distribuição de competências técnicas e comportamentais em tempo real. Identifique <span className="text-white">skill gaps</span> críticos e planeje sucessões com precisão algorítmica.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
                    <Badge variant="secondary" className="px-6 py-3 rounded-2xl bg-white text-slate-900 border-none font-black text-[10px] uppercase tracking-widest flex items-center gap-3 h-14">
                        <Building className="w-5 h-5 text-primary" />
                        Global Org
                    </Badge>
                    <div className="h-10 w-px bg-white/10 hidden md:block" />
                    <HeatmapActions data={data} />
                </div>
            </header>

            {/* Quick Stats / Legend */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Gaps Críticos', value: data.matrix.filter(m => m.gap > 0).length, icon: AlertCircle, color: 'rose', status: 'Atenção Necessária' },
                    { label: 'Mestres (Score 5)', value: data.matrix.filter(m => m.score === 5).length, icon: CheckCircle2, color: 'emerald', status: 'Prontos para Mentoria' },
                    { label: 'Média de Skills', value: (data.matrix.reduce((a, b) => a + b.score, 0) / data.matrix.length).toFixed(1), icon: LayoutGrid, color: 'indigo', status: 'Saúde Técnica' },
                    { label: 'Posições Ativas', value: data.users.length, icon: Briefcase, color: 'blue', status: 'Baseline Operacional' }
                ].map((stat, idx) => (
                    <Card key={idx} className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 hover:shadow-xl transition-all duration-500 group overflow-hidden border-b-4 hover:border-b-primary">
                        <div className="flex items-center justify-between mb-6">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                stat.color === 'rose' ? "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white shadow-lg shadow-rose-100" :
                                    stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white shadow-lg shadow-emerald-100" :
                                        stat.color === 'indigo' ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white shadow-lg shadow-indigo-100" :
                                            "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white shadow-lg shadow-blue-100"
                            )}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">{stat.value}</h3>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{stat.status}</p>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-2xl rounded-[4rem] overflow-hidden bg-white relative">
                <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-900">Matriz de Habilidades de Alta Resolução</CardTitle>
                        <CardDescription className="text-slate-400 font-medium text-lg mt-1">Nivelamento individual vs requisitos estratégicos por função.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-10">
                    <SkillHeatmap data={data} />
                </CardContent>
            </Card>

            <div className="bg-slate-50/50 rounded-[3rem] p-12 border border-slate-100 flex flex-col md:flex-row items-start gap-12 group">
                <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center border border-slate-100 shadow-xl group-hover:rotate-12 transition-transform duration-500">
                    <Info className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1 space-y-6">
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">Guia de Interpretação Executiva</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <p className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
                                <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Skill Gap Crítico</span>
                            </p>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                Células <span className="text-rose-600 font-bold">rosadas</span> indicam uma discrepância imediata entre a proficiência do colaborador e a exigência do cargo. Requer PDI de urgência.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <p className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                                <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Potencial de Liderança</span>
                            </p>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                Notas <span className="text-indigo-600 font-bold">4 ou 5</span> identificam multiplicadores internos. Considere estes talentos para programas de mentoria ou sucessão.
                            </p>
                        </div>
                    </div>
                </div>
                <Button asChild className="rounded-2xl h-16 px-10 bg-slate-900 hover:bg-primary text-white transition-all font-black uppercase tracking-widest text-[10px] shrink-0 border-none">
                    <Link href="/admin/pdi/plans">Configurar Treinamentos</Link>
                </Button>
            </div>
        </div>
    )
}
