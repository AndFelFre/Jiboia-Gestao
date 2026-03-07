'use client'

import React, { useState } from 'react'
import { Plus, Target, Calendar, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { addEvaluationSmartGoal } from '@/app/admin/actions/dho-performance'
import type { PDIItem } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface SMARTGoalsManagerProps {
    evaluationId: string
    userId: string
    goals: PDIItem[]
    isReadOnly?: boolean
}

export function SMARTGoalsManager({ evaluationId, userId, goals, isReadOnly }: SMARTGoalsManagerProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [newGoal, setNewGoal] = useState({ title: '', description: '', deadline: '' })
    const [isLoading, setIsLoading] = useState(false)

    const handleAddGoal = async () => {
        if (!newGoal.title) return
        setIsLoading(true)
        const res = await addEvaluationSmartGoal(evaluationId, userId, newGoal)
        setIsLoading(false)
        if (res.success) {
            setIsAdding(false)
            setNewGoal({ title: '', description: '', deadline: '' })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Metas SMART</h3>
                </div>
                {!isReadOnly && !isAdding && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Meta
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">O que será entregue? (Específica)</label>
                        <Input
                            placeholder="Ex: Finalizar certificação de SQL Avançado"
                            value={newGoal.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGoal({ ...newGoal, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Critérios de Sucesso (Mensurável/Relevante)</label>
                        <Textarea
                            placeholder="Descreva como saberemos que a meta foi atingida..."
                            value={newGoal.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewGoal({ ...newGoal, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Data Limite (Temporal)</label>
                        <Input
                            type="date"
                            value={newGoal.deadline}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancelar</Button>
                        <Button size="sm" onClick={handleAddGoal} disabled={isLoading || !newGoal.title}>
                            {isLoading ? 'Salvando...' : 'Salvar Meta'}
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {goals.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-500">Nenhuma meta SMART definida para este ciclo.</p>
                    </div>
                ) : (
                    goals.map((goal) => (
                        <div
                            key={goal.id}
                            className="group bg-white border border-slate-100 rounded-xl p-4 hover:border-indigo-200 transition-all shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-slate-800">{goal.title}</h4>
                                        {goal.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    </div>
                                    {goal.description && (
                                        <p className="text-sm text-slate-500 line-clamp-2">{goal.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {goal.deadline
                                                ? format(new Date(goal.deadline), "dd 'de' MMM", { locale: ptBR })
                                                : 'Sem data'}
                                        </div>
                                        <div className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                            goal.status === 'completed' ? "bg-green-100 text-green-700" :
                                                goal.status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                                                    "bg-slate-100 text-slate-600"
                                        )}>
                                            {goal.status === 'completed' ? 'Concluída' :
                                                goal.status === 'in_progress' ? 'Em Execução' : 'Pendente'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
