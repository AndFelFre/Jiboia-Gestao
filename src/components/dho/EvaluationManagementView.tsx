'use client'

import React, { useState } from 'react'
import {
    ClipboardCheck,
    Save,
    Lock,
    AlertCircle,
    ChevronRight,
    TrendingUp,
    Target,
    FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { RUARadarChart } from './RUARadarChart'
import { SMARTGoalsManager } from './SMARTGoalsManager'
import {
    updateEvaluationRUA,
    closeEvaluationCycle,
    createEvaluationCycle
} from '@/app/admin/actions/dho-performance'
import type { PerformanceEvaluation } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/feedback'

interface EvaluationManagementViewProps {
    userId: string
    evaluation: PerformanceEvaluation | null
}

export function EvaluationManagementView({ userId, evaluation }: EvaluationManagementViewProps) {
    const [activeTab, setActiveTab] = useState<'rua' | 'smart' | 'calibration'>('rua')
    const [isSaving, setIsSaving] = useState(false)
    const [isClosing, setIsClosing] = useState(false)
    const [formData, setFormData] = useState({
        resilience: evaluation?.rua_resilience ?? 3,
        utility: evaluation?.rua_utility ?? 3,
        ambition: evaluation?.rua_ambition ?? 3,
        potential_score: evaluation?.potential_score ?? 0,
        potential_comments: evaluation?.potential_comments ?? '',
        rua_comments: evaluation?.rua_comments ?? '',
        overall_comments: evaluation?.overall_comments ?? '',
        calibration_comments: evaluation?.calibration_comments ?? ''
    })

    // Para abertura de novo ciclo
    const [newCycleDates, setNewCycleDates] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
    })

    const isReadOnly = evaluation?.status === 'closed' || evaluation?.status === 'cancelled'
    const isDraft = evaluation?.status === 'draft'

    const handleSaveRUA = async (publish = false) => {
        if (!evaluation) return
        setIsSaving(true)
        const res = await updateEvaluationRUA(evaluation.id, {
            ...formData,
            status: publish ? 'in_progress' : (isDraft ? 'draft' : 'in_progress')
        })
        setIsSaving(false)
        if (res.success) {
            toast.success(publish ? 'Avaliação publicada com sucesso!' : 'Alterações salvas como rascunho.')
        } else {
            toast.error('Erro ao salvar: ' + res.error)
        }
    }

    const handleCloseCycle = async () => {
        if (!evaluation) return
        if (!formData.potential_score || formData.potential_score === 0) {
            toast.error('A nota de Potencial é obrigatória para calibrar e fechar o ciclo.')
            setActiveTab('calibration')
            return
        }
        if (!confirm('Tem certeza que deseja fechar este ciclo? A posição no 9-Box e os dados ficarão imutáveis.')) return
        setIsClosing(true)
        const res = await closeEvaluationCycle(evaluation.id)
        setIsClosing(false)
        if (res.success) {
            toast.success('Ciclo finalizado com sucesso! Dados persistidos no snapshot.')
        } else {
            toast.error('Erro ao finalizar ciclo: ' + res.error)
        }
    }

    const handleCreateCycle = async () => {
        const res = await createEvaluationCycle(userId, newCycleDates.start, newCycleDates.end)
        if (res.success) {
            toast.success('Novo ciclo de avaliação aberto com sucesso.')
        } else {
            toast.error('Erro ao abrir ciclo: ' + res.error)
        }
    }

    if (!evaluation) {
        return (
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <ClipboardCheck className="w-5 h-5 text-indigo-500" />
                        Ciclo de Avaliação
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-12 text-center">
                    <div className="max-w-sm mx-auto space-y-6">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                            <TrendingUp className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-800">Nenhum ciclo ativo</h3>
                            <p className="text-sm text-slate-500 text-pretty">
                                Inicie um novo ciclo de avaliação comportamental e tática para este colaborador.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-slate-400">Início do Período</label>
                                <Input
                                    type="date"
                                    value={newCycleDates.start}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCycleDates({ ...newCycleDates, start: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-slate-400">Fim do Período</label>
                                <Input
                                    type="date"
                                    value={newCycleDates.end}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCycleDates({ ...newCycleDates, end: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button onClick={handleCreateCycle} className="w-full bg-indigo-600 hover:bg-indigo-700">
                            Abrir Novo Ciclo
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Status Banner */}
            <div className={cn(
                "flex items-center justify-between p-4 rounded-2xl border shadow-sm",
                isReadOnly ? "bg-slate-50 border-slate-200" :
                    isDraft ? "bg-amber-50 border-amber-200" : "bg-indigo-50 border-indigo-200"
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-xl",
                        isReadOnly ? "bg-slate-200 text-slate-600" :
                            isDraft ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"
                    )}>
                        {isReadOnly ? <Lock className="w-5 h-5" /> : <ClipboardCheck className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">
                            {isReadOnly ? 'Avaliação Concluída' : isDraft ? 'Rascunho de Avaliação' : 'Avaliação em Aberto'}
                        </h3>
                        <p className="text-xs text-slate-500">
                            Período: {new Date(evaluation.reference_period_start).toLocaleDateString('pt-BR')} até {new Date(evaluation.reference_period_end).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>
                {!isReadOnly && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleCloseCycle}
                        disabled={isClosing}
                        className="flex items-center gap-2"
                    >
                        Finalizar Ciclo
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radar Chart & RUA Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-slate-200 shadow-sm rounded-2xl">
                        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-slate-800">Radar RUA</CardTitle>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <AlertCircle className="w-4 h-4 text-slate-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">R: Resiliência | U: Utilidade | A: Ambição</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </CardHeader>
                        <CardContent className="p-6">
                            <RUARadarChart
                                resilience={formData.resilience}
                                utility={formData.utility}
                                ambition={formData.ambition}
                            />

                            {!isReadOnly && (
                                <div className="mt-6 space-y-4">
                                    {['resilience', 'utility', 'ambition'].map((key) => (
                                        <div key={key} className="space-y-1.5">
                                            <div className="flex justify-between">
                                                <label className="text-xs font-bold text-slate-600 capitalize">
                                                    {key === 'resilience' ? 'Resiliência' : key === 'utility' ? 'Utilidade' : 'Ambição'}
                                                </label>
                                                <span className="text-xs font-bold text-indigo-600">{formData[key as keyof typeof formData]}/5</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="5"
                                                step="1"
                                                value={formData[key as keyof typeof formData] as number}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [key]: parseInt(e.target.value) })}
                                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Content Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-sm rounded-2xl min-h-[400px]">
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => setActiveTab('rua')}
                                className={cn(
                                    "px-6 py-4 text-sm font-bold flex items-center gap-2 transition-colors",
                                    activeTab === 'rua' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <FileText className="w-4 h-4" />
                                Avaliação Comportamental
                            </button>
                            <button
                                onClick={() => setActiveTab('smart')}
                                className={cn(
                                    "px-6 py-4 text-sm font-bold flex items-center gap-2 transition-colors",
                                    activeTab === 'smart' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <Target className="w-4 h-4" />
                                Metas SMART
                            </button>
                            <button
                                onClick={() => setActiveTab('calibration')}
                                className={cn(
                                    "px-6 py-4 text-sm font-bold flex items-center gap-2 transition-colors",
                                    activeTab === 'calibration' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <TrendingUp className="w-4 h-4" />
                                Calibração 9-Box
                            </button>
                        </div>

                        <CardContent className="p-6">
                            {activeTab === 'rua' ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Comentários RUA</label>
                                        <Textarea
                                            placeholder="Análise sobre atitude, colaboração e ambição..."
                                            value={formData.rua_comments}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, rua_comments: e.target.value })}
                                            disabled={isReadOnly}
                                            className="min-h-[120px] rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Parecer Geral do Líder</label>
                                        <Textarea
                                            placeholder="Conclusão sobre o desempenho geral no período..."
                                            value={formData.overall_comments}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, overall_comments: e.target.value })}
                                            disabled={isReadOnly}
                                            className="min-h-[120px] rounded-xl"
                                        />
                                    </div>

                                    {!isReadOnly && (
                                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                                            <Button variant="ghost" disabled={isSaving}>Descartar</Button>
                                            <Button
                                                onClick={() => handleSaveRUA(isDraft)}
                                                disabled={isSaving}
                                                className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                                            >
                                                <Save className="w-4 h-4" />
                                                {isSaving ? 'Salvando...' : (isDraft ? 'Salvar e Publicar' : 'Salvar Alterações')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === 'smart' ? (
                                <SMARTGoalsManager
                                    evaluationId={evaluation.id}
                                    userId={userId}
                                    goals={evaluation.smart_goals || []}
                                    isReadOnly={isReadOnly}
                                />
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
                                        <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            O que é Calibração de Potencial?
                                        </h4>
                                        <p className="text-xs text-indigo-700 leading-relaxed">
                                            O potencial avalia a capacidade de crescimento futuro do colaborador.
                                            Combinado com o desempenho (RUA + SMART), ele define a posição na Matriz 9-Box organizacional.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-slate-700">Nível de Potencial</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {[
                                                { val: 1, label: 'Baixo', desc: 'Focado na função atual.' },
                                                { val: 2, label: 'Médio', desc: 'Potencial de crescimento.' },
                                                { val: 3, label: 'Alto', desc: 'Pronto para novos desafios.' }
                                            ].map((p) => (
                                                <button
                                                    key={p.val}
                                                    disabled={isReadOnly}
                                                    onClick={() => setFormData({ ...formData, potential_score: p.val })}
                                                    className={cn(
                                                        "p-3 rounded-xl border text-left transition-all",
                                                        formData.potential_score === p.val
                                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-100"
                                                            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                                    )}
                                                >
                                                    <div className="font-bold text-sm tracking-tight">{p.label}</div>
                                                    <div className={cn("text-[10px]", formData.potential_score === p.val ? "text-white/80" : "text-slate-400")}>
                                                        {p.desc}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Comentários de Potencial</label>
                                        <Textarea
                                            placeholder="Justifique a avaliação de potencial e prontidão de carreira..."
                                            value={formData.potential_comments}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, potential_comments: e.target.value })}
                                            disabled={isReadOnly}
                                            className="min-h-[80px] rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            Justificativa de Calibração (Audit)
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger><AlertCircle className="w-3 h-3 text-amber-500" /></TooltipTrigger>
                                                    <TooltipContent><p className="text-xs">Obrigatório apenas se houver alteração na nota sugerida pelo gestor.</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </label>
                                        <Textarea
                                            placeholder="Descreve o porquê desta calibração final..."
                                            value={formData.calibration_comments}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, calibration_comments: e.target.value })}
                                            disabled={isReadOnly}
                                            className="min-h-[80px] rounded-xl bg-amber-50/20 border-amber-100"
                                        />
                                    </div>

                                    {evaluation.status === 'closed' && (
                                        <div className="pt-4 border-t border-slate-100">
                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Snapshot 9-Box</span>
                                                </div>
                                                <div className="text-sm font-black text-indigo-900 uppercase">
                                                    {evaluation.nine_box_quadrant?.replace('_', ' ') || 'Não definido'}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!isReadOnly && (
                                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                                            <Button
                                                onClick={() => handleSaveRUA(false)}
                                                disabled={isSaving}
                                                className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                                            >
                                                <Save className="w-4 h-4" />
                                                {isSaving ? 'Salvando...' : 'Salvar Calibração'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
