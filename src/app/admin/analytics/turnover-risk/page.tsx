'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { getTurnoverRiskAnalysis, RiskAnalysis } from '../../actions/analytics'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    AlertTriangle,
    ArrowRight,
    Brain,
    CheckCircle2,
    Search,
    ShieldAlert,
    TrendingDown
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                    <Brain className="w-16 h-16 text-primary relative z-10 animate-bounce" />
                </div>
                <p className="text-sm font-black text-slate-400 animate-pulse uppercase tracking-[0.4em]">IA Processando Padrões de Engajamento...</p>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header com context IA */}
            <header className="bg-slate-900 text-white p-12 rounded-[3rem] relative overflow-hidden shadow-2xl group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full -mr-64 -mt-64 blur-[120px] group-hover:bg-primary/20 transition-all duration-1000" />
                <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center border border-primary/30 backdrop-blur-xl shadow-lg shadow-primary/10">
                            <Brain className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight">Predictive Retention IA</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge className="bg-primary text-slate-900 font-black px-3 py-0.5 rounded-lg border-none text-[10px] uppercase tracking-wider">v1.2 ALPHA</Badge>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Engine de Previsão de Turnover</p>
                            </div>
                        </div>
                    </div>
                    <p className="max-w-2xl text-slate-400 font-medium leading-relaxed text-lg">
                        Nosso algoritmo analisa 4 vetores críticos: <span className="text-white">PDI Ativo</span>, <span className="text-white">Maturação do Onboarding</span>, <span className="text-white">Gaps de Competência</span> e <span className="text-white">Recência de Performance</span>.
                        Scores acima de <span className="text-primary font-black">60%</span> indicam alta probabilidade de desengajamento nos próximos 90 dias.
                    </p>
                </div>
            </header>

            {/* Grid de Resultados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {analyses.map((item) => (
                    <Card key={item.userId} className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden hover:shadow-2xl transition-all duration-500 group border-b-8 border-transparent hover:border-primary/20">
                        <CardHeader className="p-10 pb-6">
                            <div className="flex justify-between items-center mb-6">
                                <Badge variant="outline" className={cn(
                                    "rounded-xl border-none px-4 py-1.5 font-black uppercase text-[10px] tracking-widest",
                                    item.riskLevel === 'high' ? 'bg-rose-50 text-rose-600' :
                                        item.riskLevel === 'medium' ? 'bg-amber-50 text-amber-600' :
                                            'bg-emerald-50 text-emerald-600'
                                )}>
                                    Risco {item.riskLevel === 'high' ? 'Crítico' : item.riskLevel === 'medium' ? 'Moderado' : 'Nominal'}
                                </Badge>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-slate-900">{item.riskScore}%</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Probabilidade</p>
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-black text-slate-900 mb-1">{item.userName}</CardTitle>
                            <CardDescription className="font-bold text-primary/60 uppercase text-[10px] tracking-widest">{item.position}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-0 space-y-6">
                            <div className="relative h-3 bg-slate-50 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "absolute inset-y-0 left-0 transition-all duration-1000 rounded-full",
                                        item.riskLevel === 'high' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' :
                                            item.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                    )}
                                    style={{ width: `${item.riskScore}%` }}
                                />
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3" /> Vetores de Risco:
                                </p>
                                {item.factors.map((f, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-2xl group/factor hover:bg-slate-50 transition-colors">
                                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                        <span className="text-xs font-bold text-slate-600 leading-tight">{f}</span>
                                    </div>
                                ))}
                                {item.factors.length === 0 && (
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50/30 rounded-2xl text-emerald-600">
                                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                                        <span className="text-xs font-black uppercase tracking-widest">Colaborador em Conformidade</span>
                                    </div>
                                )}
                            </div>

                            <Button asChild variant="ghost" className="w-full rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-900 hover:text-white transition-all h-14 font-black uppercase tracking-widest text-[10px] gap-3">
                                <Link href={`/admin/users/${item.userId}`}>
                                    Análise Profunda <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                {analyses.length === 0 && !error && (
                    <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                            <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Zero Alertas Detectados</h3>
                        <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm">O ecossistema operacional está em equilíbrio. Continue monitorando os PDIs.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
