'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    ChevronLeft,
    MoreHorizontal,
    User,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Loader2,
    Zap,
    Paperclip
} from 'lucide-react'
import { transitionCandidate } from '@/services/recruitment/candidates'

import { useRouter } from 'next/navigation'

const STAGES = [
    { id: 'new', label: 'Inscritos', color: 'bg-blue-500' },
    { id: 'screening', label: 'Triagem', color: 'bg-purple-500' },
    { id: 'interview_1', label: 'Entrevista 1', color: 'bg-indigo-500' },
    { id: 'interview_2', label: 'Entrevista 2', color: 'bg-violet-500' },
    { id: 'technical', label: 'Teste Técnico', color: 'bg-orange-500' },
    { id: 'cultural', label: 'Fit Cultural', color: 'bg-yellow-500' },
    { id: 'offer', label: 'Proposta', color: 'bg-green-500' },
]

interface KanbanViewProps {
    initialCandidates: any[]
    jobs: any[]
}

export default function KanbanView({ initialCandidates, jobs }: KanbanViewProps) {
    const [movingId, setMovingId] = useState<string | null>(null)
    const router = useRouter()

    const handleMove = async (candidateId: string, currentStage: string) => {
        const currentIndex = STAGES.findIndex(s => s.id === currentStage)
        if (currentIndex === -1 || currentIndex === STAGES.length - 1) return

        const nextStage = STAGES[currentIndex + 1].id
        setMovingId(candidateId)

        const result = await transitionCandidate(candidateId, nextStage)

        if (result.success) {
            router.refresh()
        } else {
            alert(result.error)
        }
        setMovingId(null)
    }

    const handleReject = async (candidateId: string) => {
        if (!confirm('Deseja reprovar este candidato?')) return

        setMovingId(candidateId)
        const result = await transitionCandidate(candidateId, 'rejected')

        if (result.success) {
            router.refresh()
        } else {
            alert(result.error)
        }
        setMovingId(null)
    }

    return (
        <div className="flex-1 overflow-x-auto p-6">
            <div className="flex gap-4 h-full min-w-max">
                {STAGES.map((stage) => {
                    const stageCandidates = initialCandidates.filter(c => c.stage === stage.id)

                    return (
                        <div key={stage.id} className="w-80 flex flex-col gap-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${stage.color}`} />
                                    <h2 className="font-bold text-sm uppercase tracking-wider">{stage.label}</h2>
                                    <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-bold text-muted-foreground">
                                        {stageCandidates.length}
                                    </span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex-1 flex flex-col gap-3 min-h-[500px] rounded-xl bg-muted/20 p-2">
                                {stageCandidates.map((candidate) => (
                                    <Card key={candidate.id} className="p-4 hover:shadow-md transition-shadow group relative overflow-hidden">
                                        {movingId === candidate.id && (
                                            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">
                                                {candidate.full_name}
                                            </p>
                                        </div>

                                        <p className="text-[10px] text-muted-foreground uppercase font-bold mb-3 truncate">
                                            {jobs.find(j => j.id === candidate.job_id)?.title || 'Vaga não identificada'}
                                        </p>

                                        <div className="flex justify-between items-center mt-4 pt-3 border-t">
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-primary hover:bg-primary/10"
                                                    title="Avaliar Candidato (STAR)"
                                                >
                                                    <Link href={`/admin/recruitment/interviews/new/${candidate.id}`}>
                                                        <Zap className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleReject(candidate.id)}
                                                    title="Reprovar"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-green-600 hover:bg-green-50"
                                                    onClick={() => handleMove(candidate.id, stage.id)}
                                                    title="Avançar Etapa"
                                                >
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {candidate.resume_url && (
                                                    <span title="Currículo Anexado">
                                                        <Paperclip className="w-3 h-3 text-emerald-500 mr-1" />
                                                    </span>
                                                )}

                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    {new Date(candidate.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                                    <User className="w-3 h-3 text-muted-foreground" />
                                                </div>
                                            </div>

                                        </div>
                                    </Card>
                                ))}

                                {stageCandidates.length === 0 && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/30 py-12">
                                        <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-center">Tudo em dia</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                {/* Coluna de Reprovados (Opcional ou Lateral) */}
                <div className="w-80 flex flex-col gap-4 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 px-1">
                        <span className="w-2 h-2 rounded-full bg-destructive" />
                        <h2 className="font-bold text-sm uppercase tracking-wider text-destructive">Reprovados</h2>
                        <span className="bg-destructive/10 px-2 py-0.5 rounded-full text-[10px] font-bold text-destructive">
                            {initialCandidates.filter(c => c.stage === 'rejected').length}
                        </span>
                    </div>
                    <div className="flex-1 rounded-xl bg-destructive/5 border border-destructive/10 p-2 overflow-y-auto">
                        {initialCandidates.filter(c => c.stage === 'rejected').map(candidate => (
                            <div key={candidate.id} className="p-3 mb-2 bg-card rounded-lg border text-xs grayscale opacity-70">
                                <p className="font-bold mb-1">{candidate.full_name}</p>
                                <p className="text-[9px] text-muted-foreground uppercase font-bold">
                                    {jobs.find(j => j.id === candidate.job_id)?.title || 'Vaga offline'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
