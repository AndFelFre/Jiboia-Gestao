'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Save,
    MapPin,
    Zap,
    Handshake,
    CheckCircle2,
    RefreshCcw,
    AlertCircle,
    Loader2,
    Info,
    ChevronRight,
    Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { submitFieldEvaluation } from '@/app/admin/actions/field-evaluations'
import { toast } from 'sonner'

interface RouteEvaluationFormProps {
    agentId: string
    agentName: string
}

export function RouteEvaluationForm({ agentId, agentName }: RouteEvaluationFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Estados de Notas
    const [scores, setScores] = useState({
        score_planning: 0,
        score_connection: 0,
        score_diagnostic: 0,
        score_negotiation: 0 as number | null,
        score_closing: 0 as number | null,
        score_retention: 0 as number | null,
    })

    // Estados de Visibilidade (Condicionais)
    const [showNegotiation, setShowNegotiation] = useState(false)
    const [showClosing, setShowClosing] = useState(false)
    const [showRetention, setShowRetention] = useState(false)

    // Estados de Texto
    const [observations, setObservations] = useState({
        strengths: '',
        improvements: '',
        next_challenge: '',
        feedback_checkpoint: ''
    })

    const handleScore = (key: keyof typeof scores, val: number) => {
        setScores(prev => ({ ...prev, [key]: val }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const payload = {
                agent_id: agentId,
                score_planning: scores.score_planning,
                score_connection: scores.score_connection,
                score_diagnostic: scores.score_diagnostic,
                score_negotiation: showNegotiation ? scores.score_negotiation : null,
                score_closing: showClosing ? scores.score_closing : null,
                score_retention: showRetention ? scores.score_retention : null,
                ...observations
            }

            const result = await submitFieldEvaluation(payload)

            if (result.success) {
                toast.success(result.data)
                router.push('/admin/performance')
            } else {
                toast.error(result.error)
            }
        } catch (err: any) {
            toast.error('Erro ao processar formulário')
        } finally {
            setLoading(false)
        }
    }

    const ScoreSelector = ({ label, value, onChange, icon: Icon, description }: any) => (
        <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <Label className="text-base font-black text-slate-800 tracking-tight uppercase">{label}</Label>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-widest">{description}</p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                    <button
                        key={num}
                        onClick={() => onChange(num)}
                        className={cn(
                            "h-14 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center",
                            value === num
                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                : "bg-white text-slate-400 border border-slate-100 hover:border-primary/30"
                        )}
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    )

    const ConditionalSection = ({ title, isActive, onToggle, scoreKey, icon, description }: any) => (
        <Card className={cn(
            "overflow-hidden transition-all duration-300 rounded-[2.5rem]",
            isActive ? "border-primary/20 shadow-md" : "border-slate-100 opacity-60"
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", isActive ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400")}>
                        {icon}
                    </div>
                    <div>
                        <CardTitle className="text-sm font-black uppercase tracking-tight">{title}</CardTitle>
                        <CardDescription className="text-[10px]">Avaliar esta etapa hoje?</CardDescription>
                    </div>
                </div>
                <Switch checked={isActive} onCheckedChange={onToggle} />
            </CardHeader>
            {isActive && (
                <CardContent className="p-4 pt-0 animate-in fade-in slide-in-from-top-2">
                    <ScoreSelector
                        label="Nota da Etapa"
                        description={description}
                        value={scores[scoreKey as keyof typeof scores]}
                        onChange={(val: number) => handleScore(scoreKey as keyof typeof scores, val)}
                        icon={Zap}
                    />
                </CardContent>
            )}
        </Card>
    )

    return (
        <div className="max-w-2xl mx-auto pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Mobile */}
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl">
                    <ChevronRight className="w-6 h-6 rotate-180" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">RUA: {agentName}</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Acompanhamento de Rota</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Pilares Obrigatórios */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 pl-2">
                        <div className="w-1.5 h-4 bg-primary rounded-full" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Pilares Fundamentais</h2>
                    </div>

                    <ScoreSelector
                        label="Planejamento"
                        description="Micro-rotas, 10+ tarefas, Marco Polo"
                        value={scores.score_planning}
                        onChange={(val: number) => handleScore('score_planning', val)}
                        icon={MapPin}
                    />

                    <ScoreSelector
                        label="Conexão"
                        description="Consultou MP, Rapport, Intro estratégica"
                        value={scores.score_connection}
                        onChange={(val: number) => handleScore('score_connection', val)}
                        icon={Handshake}
                    />

                    <ScoreSelector
                        label="Diagnóstico"
                        description="Dores, Pagamentos, Gestão, Dados TPV"
                        value={scores.score_diagnostic}
                        onChange={(val: number) => handleScore('score_diagnostic', val)}
                        icon={Target}
                    />
                </section>

                {/* Pilares Condicionais */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 pl-2">
                        <div className="w-1.5 h-4 bg-amber-400 rounded-full" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Etapas de Transação</h2>
                    </div>

                    <ConditionalSection
                        title="Negociação"
                        icon={<Zap className="w-5 h-5" />}
                        isActive={showNegotiation}
                        onToggle={setShowNegotiation}
                        scoreKey="score_negotiation"
                        description="Prova social, Objeções, 2 Planos"
                    />

                    <ConditionalSection
                        title="Fechamento"
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        isActive={showClosing}
                        onToggle={setShowClosing}
                        scoreKey="score_closing"
                        description="Ativação agendada, Dados validados"
                    />

                    <ConditionalSection
                        title="Retomada / Anti-Churn"
                        icon={<RefreshCcw className="w-5 h-5" />}
                        isActive={showRetention}
                        onToggle={setShowRetention}
                        scoreKey="score_retention"
                        description="Queda TPV, Causas, Soluções Novas"
                    />
                </section>

                {/* Observações e Feedback */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 pl-2">
                        <div className="w-1.5 h-4 bg-emerald-400 rounded-full" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Feedback & Plano de Ação</h2>
                    </div>

                    <Card className="rounded-[2.5rem] border-slate-100">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pontos Fortes (Destaques)</Label>
                                <Textarea
                                    placeholder="O que o agente fez de excelente hoje?"
                                    className="rounded-2xl bg-slate-50/50 border-slate-100 min-h-[100px]"
                                    value={observations.strengths}
                                    onChange={(e) => setObservations(prev => ({ ...prev, strengths: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pontos de Melhoria (Gaps)</Label>
                                <Textarea
                                    placeholder="Onde o agente precisa de suporte?"
                                    className="rounded-2xl bg-slate-50/50 border-slate-100 min-h-[100px]"
                                    value={observations.improvements}
                                    onChange={(e) => setObservations(prev => ({ ...prev, improvements: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Próximo Desafio</Label>
                                    <Textarea
                                        placeholder="Meta para a próxima rota..."
                                        className="rounded-2xl bg-slate-50/50 border-slate-100 min-h-[80px]"
                                        value={observations.next_challenge}
                                        onChange={(e) => setObservations(prev => ({ ...prev, next_challenge: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Checkpoint de Feedback</Label>
                                    <Textarea
                                        placeholder="Data e local do retorno..."
                                        className="rounded-2xl bg-slate-50/50 border-slate-100 min-h-[80px]"
                                        value={observations.feedback_checkpoint}
                                        onChange={(e) => setObservations(prev => ({ ...prev, feedback_checkpoint: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Botão de Submissão Fixo Mobile */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 flex gap-4 z-50">
                    <Button
                        disabled={loading}
                        onClick={handleSubmit}
                        className="flex-1 h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20 gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Finalizar Acompanhamento
                    </Button>
                </div>
            </div>
        </div>
    )
}
