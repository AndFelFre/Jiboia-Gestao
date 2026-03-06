'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    ChevronLeft, Loader2, Target, Zap, Trophy, Brain,
    MessageCircle, Heart, Lightbulb, Shield, FastForward, Sparkles
} from 'lucide-react'
import { createInterview } from '../../../actions/recruitment-interviews'

interface InterviewFormProps {
    candidate: { id: string, full_name: string }
}

const CULTURE_PILLARS = [
    { key: 'fit_integrity', label: 'Integridade', icon: Shield, desc: 'Ética e honestidade em situações críticas.' },
    { key: 'fit_focus', label: 'Foco técnico', icon: Target, desc: 'Concentração na entrega e qualidade.' },
    { key: 'fit_learning', label: 'Aprendizado', icon: Lightbulb, desc: 'Velocidade e interesse em aprender o novo.' },
    { key: 'fit_challenge', label: 'Desafio', icon: Trophy, desc: 'Como lida com metas ousadas.' },
    { key: 'fit_communication', label: 'Comunicação', icon: MessageCircle, desc: 'Clareza e assertividade na fala.' },
    { key: 'fit_service', label: 'Serviço', icon: Heart, desc: 'Disposição para ajudar o time e o cliente.' },
    { key: 'fit_persistence', label: 'Persistência', icon: FastForward, desc: 'Resiliência diante de negativas.' },
]

export default function InterviewFormSTAR({ candidate }: InterviewFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const payload: any = {
            candidate_id: candidate.id,
            type: 'star',
            star_situation: formData.get('star_situation') as string,
            star_task: formData.get('star_task') as string,
            star_action: formData.get('star_action') as string,
            star_result: formData.get('star_result') as string,
            justification: formData.get('justification') as string,
            recommendation: formData.get('recommendation') as string,
        }

        // Captura os 7 pilares
        CULTURE_PILLARS.forEach(p => {
            payload[p.key] = parseInt(formData.get(p.key) as string)
        })

        const result = await createInterview(payload)

        if (result.success) {
            router.push('/admin/recruitment/kanban')
            router.refresh()
        } else {
            setError(result.error || 'Erro ao salvar')
            setLoading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header com Glassmorphism */}
            <div className="flex items-center justify-between mb-8 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white shadow-xl">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon" className="rounded-full">
                        <Link href="/admin/recruitment/kanban">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Verificação STAR</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            Avaliação Estratégica: <span className="font-bold text-primary">{candidate.full_name}</span>
                        </p>
                    </div>
                </div>
                <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20">
                    <Sparkles className="w-3 h-3 mr-2" />
                    Método Corporativo
                </Badge>
            </div>

            <form id="star-form" onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Coluna da Esquerda: O Método STAR */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-2xl bg-gradient-to-br from-white to-slate-50/50 rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-indigo-500" />
                                    Mapeamento de Competências (STAR)
                                </CardTitle>
                                <CardDescription>Analise comportamentos passados para prever sucessos futuros.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* S & T */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">S</div>
                                                <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Situação</label>
                                            </div>
                                            <textarea
                                                name="star_situation"
                                                required
                                                className="min-h-[120px] w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-blue-500 focus:ring-4 ring-blue-500/5 transition-all outline-none"
                                                placeholder="Descreva o contexto... Que problema estava enfrentando?"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs shadow-sm">T</div>
                                                <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Tarefa</label>
                                            </div>
                                            <textarea
                                                name="star_task"
                                                required
                                                className="min-h-[120px] w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-amber-500 focus:ring-4 ring-amber-500/5 transition-all outline-none"
                                                placeholder="Qual era o desafio específico ou a meta exigida?"
                                            />
                                        </div>
                                    </div>
                                    {/* A & R */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs shadow-sm">A</div>
                                                <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Ação</label>
                                            </div>
                                            <textarea
                                                name="star_action"
                                                required
                                                className="min-h-[120px] w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-emerald-500 focus:ring-4 ring-emerald-500/5 transition-all outline-none"
                                                placeholder="O que o candidato FEZ especificamente para resolver?"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">R</div>
                                                <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Resultado</label>
                                            </div>
                                            <textarea
                                                name="star_result"
                                                required
                                                className="min-h-[120px] w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-indigo-500 focus:ring-4 ring-indigo-500/5 transition-all outline-none"
                                                placeholder="Qual foi o impacto final? Use números se possível."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Justificativa Final */}
                        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-2xl">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-blue-400" />
                                Parecer Técnico Final
                            </h3>
                            <textarea
                                name="justification"
                                required
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:bg-white/10 transition-all outline-none placeholder:text-slate-500"
                                placeholder="Por que este candidato deve (ou não) avançar para a próxima etapa?"
                            />
                        </div>
                    </div>

                    {/* Coluna da Direita: Fit Cultural & Recomendação */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-rose-500" />
                                    Fit Cultural (Os 7 Pilares)
                                </CardTitle>
                                <CardDescription>Avaliação de alinhamento com os valores.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {CULTURE_PILLARS.map((p) => (
                                    <div key={p.key} className="space-y-1.5 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <p.icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                <span className="text-xs font-bold uppercase tracking-tighter text-slate-600">{p.label}</span>
                                            </div>
                                            <select
                                                name={p.key}
                                                className="text-xs font-bold bg-transparent outline-none text-primary cursor-pointer"
                                            >
                                                <option value="1">1 - Baixo</option>
                                                <option value="2">2 - Médio</option>
                                                <option value="3" defaultValue="3">3 - Alto</option>
                                                <option value="4">4 - Supera</option>
                                            </select>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-tight">{p.desc}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-2xl bg-primary text-primary-foreground rounded-3xl">
                            <CardHeader>
                                <CardTitle className="text-base">Decisão Final</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <select
                                    name="recommendation"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold outline-none appearance-none"
                                >
                                    <option value="yes" className="text-slate-900">RECOMENDO CONTRATAÇÃO</option>
                                    <option value="strong_yes" className="text-slate-900">RECOMENDAÇÃO FORTE</option>
                                    <option value="no" className="text-slate-900">NÃO RECOMENDO</option>
                                    <option value="strong_no" className="text-slate-900">FORTE REJEIÇÃO</option>
                                </select>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="submit"
                                    form="star-form"
                                    disabled={loading}
                                    className="w-full bg-white text-primary hover:bg-slate-100 rounded-2xl h-12 font-bold shadow-lg"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CONCLUIR AVALIAÇÃO'}
                                </Button>
                            </CardFooter>
                        </Card>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium animate-bounce">
                                ⚠️ {error}
                            </div>
                        )}
                    </div>

                </div>
            </form>
        </div>
    )
}
