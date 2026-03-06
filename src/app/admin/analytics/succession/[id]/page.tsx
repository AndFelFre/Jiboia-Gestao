'use client'

import { useState } from 'react'
import { generateSuccessionPlan } from '@/app/actions/succession'
import { Button } from '@/components/ui/button'
import { BrainCircuit, Star, Target, Zap, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface SuccessionData {
    readinessScore: number
    strengths: string[]
    developmentAreas: string[]
    recommendedNextSteps: string[]
    isAiGenerated: boolean
}

export default function SuccessionProfilePage({ params }: { params: { id: string } }) {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<SuccessionData | null>(null)
    const [errorMsg, setErrorMsg] = useState('')

    const handleGenerate = async () => {
        setLoading(true)
        setErrorMsg('')

        const res = await generateSuccessionPlan({ userId: params.id })

        if (res.success && res.data) {
            setData(res.data)
        } else {
            setErrorMsg(res.error || 'Falha ao processar o relatório de sucessão.')
        }

        setLoading(false)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            <Link
                href="/admin/analytics/succession"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o Pool de Talentos
            </Link>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                    <BrainCircuit className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Relatório Executivo de Sucessão</h1>
                <p className="text-muted-foreground mt-2 max-w-xl">
                    Nossa IA (ou motor avaliativo Heurístico) cruza dados das últimas avaliações de desempenho, interações e metadados para ditar se o colaborador está pronto para dar o próximo passo na organização.
                </p>

                {!data && (
                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {loading ? (
                            <span className="flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando Perfil...</span>
                        ) : (
                            <span className="flex items-center"><Star className="w-4 h-4 mr-2" /> Gerar Plano de Sucessão</span>
                        )}
                    </Button>
                )}
            </div>

            {errorMsg && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro ao processar avaliação</AlertTitle>
                    <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
            )}

            {/* Exibição dos Dados Pós-processamento */}
            {data && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Score */}
                    <div className="bg-card border border-border rounded-xl p-6 col-span-1 md:col-span-3 flex flex-col md:flex-row items-center gap-8 justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Índice de Prontidão</h2>
                            <p className="text-muted-foreground text-sm">Baseado na performance cíclica {data.isAiGenerated ? '(Gerado por IA)' : '(Cálculo Local)'}.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                                    {data.readinessScore}%
                                </span>
                                <p className="font-medium text-sm text-foreground mt-1">
                                    {data.readinessScore > 80 ? 'Fortemente Promovível' : data.readinessScore > 60 ? 'Em Desenvolvimento' : 'Atenção Requerida'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Forças */}
                    <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 text-green-500/10">
                            <Zap className="w-24 h-24" />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-green-500/20 text-green-600 rounded">
                                <Zap className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-foreground">Fortalezas</h3>
                        </div>
                        <ul className="space-y-3 relative z-10">
                            {data.strengths.map((s, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">•</span>
                                    <span className="text-muted-foreground">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Fraquezas */}
                    <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 text-orange-500/10">
                            <Target className="w-24 h-24" />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-orange-500/20 text-orange-600 rounded">
                                <Target className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-foreground">Pontos de Atenção</h3>
                        </div>
                        <ul className="space-y-3 relative z-10">
                            {data.developmentAreas.map((d, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                    <span className="text-orange-500 mt-0.5">•</span>
                                    <span className="text-muted-foreground">{d}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Próximos Passos */}
                    <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 text-indigo-500/10">
                            <BrainCircuit className="w-24 h-24" />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-indigo-500/20 text-indigo-600 rounded">
                                <Star className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-foreground">Ação Recomendada</h3>
                        </div>
                        <ul className="space-y-3 relative z-10">
                            {data.recommendedNextSteps.map((s, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                    <span className="text-indigo-500 mt-0.5 font-bold">{i + 1}.</span>
                                    <span className="text-muted-foreground">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}
