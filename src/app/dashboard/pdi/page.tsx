'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { Target, TrendingUp, BookOpen, UserPlus, Lightbulb, ChevronRight, CheckCircle2, Clock } from 'lucide-react'
import { getMyPDIData, addPDIItem } from '@/app/admin/actions/pdi'
import type { SkillGap, PDIPlan, PDIItem } from '@/types'

export default function PDIPage() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<{
        plan: PDIPlan | null,
        items: PDIItem[],
        gaps: SkillGap[],
        nextPosition: any
    } | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const res = await getMyPDIData()
        if (res.success && res.data) {
            setData(res.data)
        }
        setLoading(false)
    }

    if (loading) return <div className="p-8 text-center">Carregando plano de desenvolvimento...</div>

    const chartData = data?.gaps.map(g => ({
        subject: g.skill_name,
        atual: g.current_level,
        meta: g.required_level,
        fullMark: 5
    }))

    return (
        <div className="space-y-8 p-6 animate-in fade-in duration-500">
            {/* Header com Status de Carreira */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meu PDI</h1>
                    <p className="text-muted-foreground">Analise seus gaps e trilhe seu caminho para o próximo nível.</p>
                </div>
                {data?.nextPosition && (
                    <div className="flex items-center gap-3 bg-primary/10 p-3 rounded-2xl border border-primary/20">
                        <Target className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-primary/70">Objetivo de Carreira</p>
                            <p className="font-semibold text-sm">{data.nextPosition.title}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Visualização de Gaps (Gráfico de Radar) */}
                <Card className="lg:col-span-2 overflow-hidden border-none shadow-xl bg-gradient-to-br from-white to-slate-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Análise de Gaps
                        </CardTitle>
                        <CardDescription>Comparação do seu nível atual com os requisitos do cargo de {data?.nextPosition?.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {chartData && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 5]} />
                                    <Radar
                                        name="Meu Nível"
                                        dataKey="atual"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.6}
                                    />
                                    <Radar
                                        name="Requisito"
                                        dataKey="meta"
                                        stroke="#94a3b8"
                                        fill="#94a3b8"
                                        fillOpacity={0.2}
                                    />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <CheckCircle2 className="w-12 h-12 mb-2 text-green-500" />
                                <p>Você já atingiu os requisitos para o próximo nível!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sugestões de Ação */}
                <Card className="border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            Ações Sugeridas
                        </CardTitle>
                        <CardDescription>Baseado nos seus maiores gaps de competência.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data?.gaps.slice(0, 3).map(gap => (
                            <div key={gap.skill_id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-semibold text-sm group-hover:text-blue-600 transition-colors">{gap.skill_name}</p>
                                    <Badge variant="outline" className="text-amber-600 bg-amber-50">Gap {gap.gap}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">Recomendado: Curso de {gap.skill_name} ou Mentoria.</p>
                                <Button variant="ghost" size="sm" className="w-full text-xs font-medium justify-between group-hover:bg-blue-50">
                                    Adicionar ao Plano
                                    <ChevronRight className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

            </div>

            {/* Plano de Ação - Listagem */}
            <Card className="border-none shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Plano de Ação</CardTitle>
                        <CardDescription>Atividades práticas para o seu desenvolvimento.</CardDescription>
                    </div>
                    <Button className="rounded-full shadow-lg shadow-primary/20">Novo Item</Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data?.items.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50/50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{item.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Sem prazo'}
                                            <span className="mx-1">•</span>
                                            <span className="capitalize">{item.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge className={item.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}>
                                    {item.status === 'completed' ? 'Concluído' : 'Em Progresso'}
                                </Badge>
                            </div>
                        ))}
                        {data?.items.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-3xl">
                                <p>Nenhuma ação cadastrada no seu PDI.</p>
                                <p className="text-xs">Comece adicionando uma sugestão ao lado! ✨</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
