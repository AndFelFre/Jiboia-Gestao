'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    Star,
    Brain,
    Zap,
    ChevronLeft,
    Save,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    Loader2
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

    const isComplete = skills.every(s => scores[s.id]?.score > 0)

    const handleSubmit = async () => {
        if (!isComplete) {
            alert('Por favor, avalie todas as competências antes de finalizar.')
            return
        }

        setLoading(true)
        const payload = Object.entries(scores).map(([skillId, data]) => ({
            skill_id: skillId,
            score: data.score,
            comments: data.comments
        }))

        const result = await submitEvaluation(evaluation.id, payload)

        if (result.success) {
            router.push('/admin/performance/evaluations')
            router.refresh()
        } else {
            alert(result.error)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-8 pb-20">
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
                    <Button onClick={handleSubmit} disabled={loading || !isComplete} className="bg-primary hover:bg-primary/90">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Finalizar Avaliação
                    </Button>
                </div>
            </div>

            {!isComplete && (
                <div className="bg-orange-500/10 border border-orange-200 p-4 rounded-xl flex items-center gap-3 text-orange-700">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">Ainda faltam {skills.filter(s => !scores[s.id]?.score).length} competências para avaliar.</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                {skills.map((skill) => {
                    const currentData = scores[skill.id] || { score: 0, comments: '' }

                    return (
                        <Card key={skill.id} className={`transition-all ${currentData.score > 0 ? 'border-l-4 border-l-green-500 shadow-sm' : 'border-l-4 border-l-muted'}`}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${skill.category === 'hard_skill' ? 'bg-orange-500/10' : 'bg-blue-500/10'}`}>
                                            {skill.category === 'hard_skill' ? <Zap className="h-5 w-5 text-orange-500" /> : <Brain className="h-5 w-5 text-blue-500" />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold">{skill.name}</CardTitle>
                                            <CardDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                                                Expectativa do Cargo: Nível {skill.required_level}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {currentData.score > 0 && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-sm text-muted-foreground leading-relaxed italic">
                                    "{skill.description || 'Sem descrição específica para esta competência.'}"
                                </p>

                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Atribua a nota (1 a 5)</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => handleScoreChange(skill.id, level)}
                                                    className={`p-2 rounded-lg border-2 transition-all hover:scale-110 ${currentData.score >= level
                                                        ? 'bg-yellow-500/10 border-yellow-500 text-yellow-600 shadow-inner'
                                                        : 'border-muted hover:border-yellow-200'
                                                        }`}
                                                >
                                                    <Star className={`h-6 w-6 ${currentData.score >= level ? 'fill-current' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                        {currentData.score > 0 && (
                                            <div className="px-3 py-1 rounded-full bg-muted font-black text-xs">
                                                SCORE: {currentData.score}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <MessageSquare className="h-3 w-3" /> Justificativa / Exemplos (Opcional)
                                    </Label>
                                    <textarea
                                        value={currentData.comments}
                                        onChange={(e) => handleCommentChange(skill.id, e.target.value)}
                                        placeholder={`- Colaborador &quot;muito experiente&quot; pode ter scores altos mas gaps em novas tecnologias.\n- Sempre alinhe o resultado com o feedback &quot;cara a cara&quot; antes de fechar o ciclo.`}
                                        className="w-full min-h-[100px] p-3 rounded-lg border bg-muted/20 text-sm focus:ring-2 ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="bg-card border p-8 rounded-2xl shadow-xl flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 mb-2">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold">Resumo da Avaliação</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                    Ao clicar em finalizar, esta avaliação será salva e o status mudará para **Concluído**. O colaborador poderá ter acesso aos feedbacks após o fechamento do ciclo.
                </p>
                <div className="pt-4 flex gap-4">
                    <Button size="lg" onClick={handleSubmit} disabled={loading || !isComplete} className="px-10 py-6 text-lg font-bold">
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                        Finalizar e Salvar
                    </Button>
                </div>
            </div>
        </div>
    )
}
