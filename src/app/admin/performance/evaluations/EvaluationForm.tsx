'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Star,
    Brain,
    Zap,
    ChevronLeft,
    Save,
    AlertCircle,
    CheckCircle2,
    Loader2,
    TrendingUp,
    Calculator
} from 'lucide-react'
import { submitEvaluation } from '@/app/admin/actions/performance-evaluations'

interface SkillInfo {
    id: string
    name: string
    category: string
    description: string
    required_level: number
}

interface EvaluationFormProps {
    evaluation: any
}

export default function EvaluationForm({ evaluation }: EvaluationFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [scores, setScores] = useState<Record<string, { score: number, comments: string }>>(() => {
        const initial: any = {}
        evaluation.scores?.forEach((s: any) => {
            initial[s.skill_id] = { score: s.score, comments: s.comments || '' }
        })
        return initial
    })

    const [rua, setRua] = useState({
        resilience: evaluation.rua_resilience || 0,
        utility: evaluation.rua_utility || 0,
        ambition: evaluation.rua_ambition || 0
    })
    const [potential, setPotential] = useState(evaluation.potential_score || 0)

    // Extrair skills do cargo do usuário avaliado
    const skills: SkillInfo[] = evaluation.user?.position?.skills?.map((ps: any) => ({
        id: ps.skill.id,
        name: ps.skill.name,
        category: ps.skill.category,
        description: ps.skill.description,
        required_level: ps.required_level
    })) || []

    const handleScoreChange = (skillId: string, score: number) => {
        setScores(prev => ({
            ...prev,
            [skillId]: { ...(prev[skillId] || { comments: '' }), score }
        }))
    }

    const handleCommentChange = (skillId: string, comments: string) => {
        setScores(prev => ({
            ...prev,
            [skillId]: { ...(prev[skillId] || { score: 0 }), comments }
        }))
    }

    // Cálculo Live do 9-Box
    const getLiveQuadrant = () => {
        const {
            calculatePerformanceScore,
            calculatePerformanceBucket
        } = require('@/lib/kpi-engine')

        const ruaMean = (rua.resilience + rua.utility + rua.ambition) / 3
        const smartGoals = evaluation.smart_goals || []
        const hasSmart = smartGoals.length > 0
        const completedSmart = smartGoals.filter((g: any) => g.status === 'completed' || g.status === 'achieved').length
        const smartProgress = hasSmart ? completedSmart / smartGoals.length : 0

        // USANDO MOTOR CENTRALIZADO
        const performanceScore = calculatePerformanceScore(ruaMean, smartProgress, hasSmart)
        const perfBucket = calculatePerformanceBucket(performanceScore)

        if (potential === 0) return null

        const matrix: Record<string, string> = {
            '1-3': 'Dilema', '2-3': 'Estrela em Ascensão', '3-3': 'Estrela',
            '1-2': 'Questionável', '2-2': 'Mantenedor Crítico', '3-2': 'Futura Estrela',
            '1-1': 'Risco', '2-1': 'Especialista Eficaz', '3-1': 'Profissional Sólido'
        }
        return {
            name: matrix[`${perfBucket}-${potential}`],
            bucket: perfBucket,
            potential: potential
        }
    }

    const liveQuad = getLiveQuadrant()

    const isComplete = skills.every(s => scores[s.id]?.score > 0) &&
        rua.resilience > 0 && rua.utility > 0 && rua.ambition > 0 &&
        potential > 0

    const handleSubmit = async () => {
        if (!isComplete) {
            alert('Por favor, avalie todas as competências, RUA e Potencial antes de enviar para calibração.')
            return
        }

        setLoading(true)
        const skillScores = Object.entries(scores).map(([skillId, data]) => ({
            skill_id: skillId,
            score: data.score,
            comments: data.comments
        }))

        // Primeiro salva os scores das competências
        const result = await submitEvaluation(evaluation.id, skillScores)

        if (result.success) {
            // Depois atualiza RUA, Potencial e envia para calibração
            const { updateEvaluationRUA } = await import('@/app/admin/actions/dho-performance')
            const calibrationRes = await updateEvaluationRUA(evaluation.id, {
                resilience: rua.resilience,
                utility: rua.utility,
                ambition: rua.ambition,
                potential_score: potential,
                status: 'pending_calibration'
            })

            if (calibrationRes.success) {
                router.push('/admin/performance/evaluations')
                router.refresh()
            } else {
                alert(calibrationRes.error)
            }
        } else {
            alert(result.error)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-8 pb-32">
            <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md py-4 z-20 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Avaliação de Desempenho</h1>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            {evaluation.cycle_name} • Avaliado: {evaluation.user?.full_name}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.back()} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !isComplete} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all hover:scale-105">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Enviar para Calibração
                    </Button>
                </div>
            </div>

            {/* Matrix Preview Sticky Side */}
            <div className="fixed right-8 top-32 hidden xl:block w-64 space-y-4">
                <Card className="border-2 border-indigo-100 shadow-xl overflow-hidden">
                    <CardHeader className="bg-indigo-50 py-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-700 flex items-center gap-2">
                            <Zap className="w-3 h-3" /> 9-Box Preview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col items-center">
                        <div className="grid grid-cols-3 gap-1 w-full aspect-square bg-slate-100 p-1 rounded-lg relative">
                            {[3, 2, 1].map(y => [1, 2, 3].map(x => (
                                <div key={`${x}-${y}`} className={`rounded border ${liveQuad?.bucket === x && liveQuad?.potential === y ? 'bg-indigo-500 border-indigo-600 shadow-lg' : 'bg-white border-slate-200 opacity-40'}`}>
                                    {liveQuad?.bucket === x && liveQuad?.potential === y && (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            )))}
                        </div>
                        {liveQuad ? (
                            <div className="mt-4 text-center">
                                <p className="text-[10px] font-black uppercase text-slate-400">Enquadramento Atual</p>
                                <p className="text-sm font-bold text-indigo-600 mt-1">{liveQuad.name}</p>
                            </div>
                        ) : (
                            <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
                                Preencha RUA e Potencial para ver o enquadramento.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {!isComplete && (
                <div className="bg-orange-500/10 border border-orange-200 p-4 rounded-xl flex items-center gap-3 text-orange-700">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold">Checklist de Finalização:</p>
                        <ul className="text-xs space-y-1 mt-1 opacity-80">
                            <li>{skills.every(s => scores[s.id]?.score > 0) ? '✅' : '❌'} Todas as competências avaliadas</li>
                            <li>{rua.resilience > 0 && rua.utility > 0 && rua.ambition > 0 ? '✅' : '❌'} Notas RUA preenchidas</li>
                            <li>{potential > 0 ? '✅' : '❌'} Nível de Potencial definido</li>
                        </ul>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 max-w-4xl">
                {/* 1. Competências Técnicas e Comportamentais */}
                <div className="space-y-6">
                    <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">I. Competências</h2>
                    {skills.map((skill) => {
                        const currentData = scores[skill.id] || { score: 0, comments: '' }
                        return (
                            <Card key={skill.id} className={`transition-all ${currentData.score > 0 ? 'border-l-4 border-l-emerald-500 shadow-sm' : 'border-l-4 border-l-muted'}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${skill.category === 'hard_skill' ? 'bg-orange-500/10' : 'bg-blue-500/10'}`}>
                                                {skill.category === 'hard_skill' ? <Zap className="h-5 w-5 text-orange-500" /> : <Brain className="h-5 w-5 text-blue-500" />}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-bold">{skill.name}</CardTitle>
                                                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    Expectativa do Cargo: Nível {skill.required_level}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        {currentData.score > 0 && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 pl-4 py-1">
                                        "{skill.description || 'Sem descrição específica.'}"
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <button key={level} onClick={() => handleScoreChange(skill.id, level)}
                                                    className={`p-2 rounded-lg border-2 transition-all hover:scale-110 ${currentData.score >= level ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'border-muted'}`}>
                                                    <Star className={`h-6 w-6 ${currentData.score >= level ? 'fill-current' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                        {currentData.score > 0 && <Badge variant="secondary" className="font-black">NOTA: {currentData.score}</Badge>}
                                    </div>
                                    <textarea value={currentData.comments} onChange={(e) => handleCommentChange(skill.id, e.target.value)}
                                        placeholder="Evidências ou exemplos práticos..." className="w-full min-h-[80px] p-3 rounded-lg border bg-muted/20 text-sm focus:ring-2 ring-primary/20 outline-none" />
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* 2. Comportamento RUA */}
                <div className="space-y-6 pt-8">
                    <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">II. Comportamento (RUA)</h2>
                    <Card className="border-l-4 border-l-indigo-500">
                        <CardContent className="p-6 space-y-8">
                            {[
                                { key: 'resilience', label: 'Resiliência', desc: 'Capacidade de lidar com pressão e frustrações.' },
                                { key: 'utility', label: 'Utilidade', desc: 'Qual o valor que entrega para o time e empresa diariamente.' },
                                { key: 'ambition', label: 'Ambição', desc: 'Desejo de crescer e atingir novos patamares.' }
                            ].map((item) => (
                                <div key={item.key} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="font-bold text-sm uppercase">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((val) => (
                                                <button key={val} onClick={() => setRua(prev => ({ ...prev, [item.key as keyof typeof rua]: val }))}
                                                    className={`w-8 h-8 rounded-md border flex items-center justify-center text-xs font-black transition-all ${rua[item.key as keyof typeof rua] === val ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-110' : 'bg-muted/50 border-border opacity-50'}`}>
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Potencial (Eixo Y do 9-Box) */}
                <div className="space-y-6 pt-8">
                    <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">III. Potencial</h2>
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-4">
                                <p className="text-xs text-muted-foreground max-w-sm">
                                    O potencial avalia a capacidade de assumir novos desafios e crescer verticalmente na organização.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { val: 1, label: 'Baixo', desc: 'Domínio atual satisfatório, mas sem sinais de prontidão para novas esferas.' },
                                        { val: 2, label: 'Médio', desc: 'Consegue assumir mais responsabilidades em breve.' },
                                        { val: 3, label: 'Alto', desc: 'Pronto para novos saltos e liderança.' }
                                    ].map((p) => (
                                        <button key={p.val} onClick={() => setPotential(p.val)}
                                            className={`p-4 rounded-xl border-2 text-left space-y-1 transition-all ${potential === p.val ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-100' : 'border-border opacity-60 hover:opacity-100'}`}>
                                            <p className="font-black text-xs uppercase tracking-widest">{p.label}</p>
                                            <p className="text-[10px] leading-tight text-muted-foreground">{p.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="max-w-4xl bg-card border p-8 rounded-2xl shadow-xl flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-2">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold">Resumo da Calibração</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                    Ao enviar para calibração, o ciclo mudará para status **Calibração Pendente**. O RH e a diretoria farão a revisão final antes do fechamento oficial do 9-Box.
                </p>
                <div className="pt-4 flex gap-4">
                    <Button size="lg" onClick={handleSubmit} disabled={loading || !isComplete} className="px-10 py-6 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl hover:scale-105 transition-all">
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                        Finalizar e Enviar
                    </Button>
                </div>
            </div>
        </div>
    )
}
