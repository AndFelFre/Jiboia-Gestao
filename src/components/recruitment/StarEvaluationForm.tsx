'use client'

import { useState } from 'react'
import { createInterview } from '@/app/recruitment/actions'
import { useRouter } from 'next/navigation'
import { Star, MessageSquare } from 'lucide-react'

export function StarEvaluationForm({ candidateId }: { candidateId: string }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)

        const result = await createInterview({
            candidate_id: candidateId,
            type: formData.get('type') as string,
            star_situation: formData.get('star_situation') as string,
            star_task: formData.get('star_task') as string,
            star_action: formData.get('star_action') as string,
            star_result: formData.get('star_result') as string,
            fit_integrity: parseInt(formData.get('fit_integrity') as string) || 0,
            fit_focus: parseInt(formData.get('fit_focus') as string) || 0,
            fit_learning: parseInt(formData.get('fit_learning') as string) || 0,
            justification: formData.get('justification') as string,
            recommendation: formData.get('recommendation') as string,
            conducted_at: new Date().toISOString(),
        })

        if (result.success) {
            router.refresh()
            const form = e.target as HTMLFormElement
            form.reset()
        } else {
            setError(result.error || 'Erro ao salvar avaliação')
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
                    <Star className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Nova Avaliação (STAR)</h3>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Tipo de Entrevista / Passo</label>
                    <select
                        name="type"
                        required
                        className="w-full px-3 py-2 border border-input rounded-md focus:ring-primary focus:border-primary shadow-sm"
                    >
                        <option value="screening">Triagem Inicial (Screening)</option>
                        <option value="cultural">Fit Cultural</option>
                        <option value="technical">Técnica / Hard Skills</option>
                        <option value="manager">Com as Lideranças</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Recomendação Parcial</label>
                    <select
                        name="recommendation"
                        required
                        className="w-full px-3 py-2 border border-input rounded-md focus:ring-primary focus:border-primary shadow-sm"
                    >
                        <option value="Avançar">Avançar Candidato</option>
                        <option value="Avançar com Ressalvas">Avançar com Ressalvas</option>
                        <option value="Reprovar">Reprovar</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4 mb-6 pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    Metodologia S.T.A.R
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">SITUAÇÃO (Situation)</label>
                        <textarea name="star_situation" rows={2} required placeholder="Qual era o contexto ou desafio?" className="w-full px-3 py-2 border border-input rounded-md focus:ring-primary focus:border-primary text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">TAREFA (Task)</label>
                        <textarea name="star_task" rows={2} required placeholder="Qual era o papel e objetivo do candidato?" className="w-full px-3 py-2 border border-input rounded-md focus:ring-primary focus:border-primary text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">AÇÃO (Action)</label>
                        <textarea name="star_action" rows={2} required placeholder="O que o candidato efetivamente FEZ?" className="w-full px-3 py-2 border border-input rounded-md focus:ring-primary focus:border-primary text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">RESULTADO (Result)</label>
                        <textarea name="star_result" rows={2} required placeholder="Qual foi o desfecho e impacto liderado pelo candidato?" className="w-full px-3 py-2 border border-input rounded-md focus:ring-primary focus:border-primary text-sm" />
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-6 pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground text-sm">Avaliação de Cultura (1 a 5)</h4>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Integridade / Transparência</label>
                        <input type="number" name="fit_integrity" min="1" max="5" defaultValue="3" required className="w-full px-3 py-2 border border-input rounded-md focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Foco no Cliente / Dono</label>
                        <input type="number" name="fit_focus" min="1" max="5" defaultValue="3" required className="w-full px-3 py-2 border border-input rounded-md focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Aprender / Desaprender</label>
                        <input type="number" name="fit_learning" min="1" max="5" defaultValue="3" required className="w-full px-3 py-2 border border-input rounded-md focus:ring-primary focus:border-primary" />
                    </div>
                </div>
            </div>

            <div className="mb-6 pt-4 border-t border-border">
                <label className="block text-sm font-medium text-foreground mb-1">Justificativa Final / Parecer do Recrutador</label>
                <textarea name="justification" rows={3} required placeholder="Síntese da avaliação geral e motivos do Fit ou descarte..." className="w-full px-3 py-2 border border-input rounded-md focus:ring-primary focus:border-primary text-sm" />
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                    {loading ? 'Salvando...' : 'Salvar Avaliação STAR'}
                </button>
            </div>
        </form>
    )
}
