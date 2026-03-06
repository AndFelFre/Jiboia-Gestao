'use client'

import { useEffect, useState } from 'react'
import { getTurnoverRiskAnalysis, RiskAnalysis } from '../../actions/analytics'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    AlertTriangle,
    TrendingDown,
    ArrowRight,
    RefreshCcw,
    Search,
    Brain,
    Info,
    CheckCircle2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

export default function TurnoverRiskPage() {
    const [analyses, setAnalyses] = useState<RiskAnalysis[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const res = await getTurnoverRiskAnalysis()
        if (res.success && res.data) {
            setAnalyses(res.data)
        } else {
            setError(res.error || 'Erro ao carregar análise preditiva')
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
                <Brain className="w-12 h-12 text-primary animate-pulse" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse font-mono uppercase tracking-widest">IA analisando padrões de engajamento...</p>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header com context IA */}
            <header className="bg-slate-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <Brain className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Predictive Retention IA</h1>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Análise de Risco de Turnover v1.0</p>
                        </div>
                    </div>
                    <p className="max-w-2xl text-slate-300 leading-relaxed">
                        Nosso algoritmo analisa 4 vetores críticos: **PDI**, **Onboarding**, **Gaps de Skills** e **Recência de Performance**.
                        Scores acima de **60%** indicam alta probabilidade de desengajamento nos próximos 90 dias.
                    </p>
                </div>
            </header>

            {/* Grid de Resultados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyses.map((item) => (
                    <Card key={item.userId} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden hover:shadow-2xl transition-all group border-2 border-transparent hover:border-primary/10">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className={`rounded-full border-none px-3 font-bold uppercase text-[10px] ${item.riskLevel === 'high' ? 'bg-red-500/10 text-red-600' :
                                        item.riskLevel === 'medium' ? 'bg-amber-500/10 text-amber-600' :
                                            'bg-emerald-500/10 text-emerald-600'
                                    }`}>
                                    Risco {item.riskLevel === 'high' ? 'Alto' : item.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                                </Badge>
                                <span className="text-2xl font-black text-slate-900">{item.riskScore}%</span>
                            </div>
                            <CardTitle className="text-xl font-bold">{item.userName}</CardTitle>
                            <CardDescription className="font-medium text-slate-400">{item.position}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-4">
                            <Progress
                                value={item.riskScore}
                                className="h-2 rounded-full"
                            />

                            <div className="space-y-2 pt-4 border-t border-slate-50">
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Fatores Identificados:</p>
                                {item.factors.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                                        <span>{f}</span>
                                    </div>
                                ))}
                                {item.factors.length === 0 && (
                                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                                        <span>Colaborador engajado e em dia</span>
                                    </div>
                                )}
                            </div>

                            <Button asChild variant="ghost" className="w-full rounded-2xl border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all h-12">
                                <Link href={`/admin/users/${item.userId}`}>
                                    Ver Perfil Detalhado <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                {analyses.length === 0 && !error && (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Search className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="font-bold text-slate-900">Nenhum risco detectado</h3>
                        <p className="text-sm text-slate-400">Todos os colaboradores ativos parecem estar engajados.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
