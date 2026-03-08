'use client'

import React, { useState } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Save, PlusCircle, PieChart, Users, TrendingUp } from 'lucide-react'

// Definição dos blocos englobados pelo sistema
export type WidgetType = 'turnover_chart' | 'pipeline_funnel' | 'employee_count'
export interface Widget {
    id: string
    type: WidgetType
    title: string
}

const AVAILABLE_WIDGETS: Omit<Widget, 'id'>[] = [
    { type: 'turnover_chart', title: 'Gráfico de Turnover (Linha)' },
    { type: 'pipeline_funnel', title: 'Funil de Recrutamento (Métricas)' },
    { type: 'employee_count', title: 'Contagem de Colaboradores (Cards)' },
]

// Item Sortable Indvidual
function SortableItem({ id, widget, onRemove }: { id: string, widget: Widget, onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style} className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <button {...attributes} {...listeners} className="cursor-grab hover:text-primary transition-colors focus:outline-none">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                </button>
                <div className="p-2 bg-muted rounded-md text-primary">
                    {widget.type === 'turnover_chart' && <TrendingUp className="w-4 h-4" />}
                    {widget.type === 'pipeline_funnel' && <PieChart className="w-4 h-4" />}
                    {widget.type === 'employee_count' && <Users className="w-4 h-4" />}
                </div>
                <span className="font-medium text-foreground">{widget.title}</span>
            </div>
            <button
                onClick={() => onRemove(id)}
                className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                title="Remover widget"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

interface ReportBuilderProps {
    initialData?: {
        name: string,
        config: { widgets: Widget[] }
    }
    onSave: (payload: { name: string, config: any }) => Promise<void>
    isSaving: boolean
}

export function ReportBuilder({ initialData, onSave, isSaving }: ReportBuilderProps) {
    const [reportName, setReportName] = useState(initialData?.name || '')
    const [widgets, setWidgets] = useState<Widget[]>(initialData?.config?.widgets || [])
    const [saveError, setSaveError] = useState('')
    const [isAutoSaving, setIsAutoSaving] = useState(false)

    // Estratégia de Debounce Agressivo (Engenharia de Performance)
    // Evita overhead de GIN Indexes no banco durante a edição fluida
    React.useEffect(() => {
        if (!reportName.trim() || widgets.length === 0) return

        const timer = setTimeout(async () => {
            setIsAutoSaving(true)
            try {
                await onSave({
                    name: reportName,
                    config: { widgets }
                })
                setSaveError('')
            } catch (err) {
                setSaveError('Erro no salvamento automático')
            } finally {
                setIsAutoSaving(false)
            }
        }, 2000)

        return () => clearTimeout(timer)
    }, [widgets, reportName, onSave])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setWidgets((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id)
                const newIndex = items.findIndex(i => i.id === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const handleAddWidget = (widgetInfo: Omit<Widget, 'id'>) => {
        setWidgets(prev => [...prev, { ...widgetInfo, id: crypto.randomUUID() }])
    }

    const handleRemoveWidget = (id: string) => {
        setWidgets(prev => prev.filter(w => w.id !== id))
    }

    const handleSaveProcess = () => {
        if (!reportName.trim()) {
            setSaveError("Por favor, informe um nome para o relatório.")
            return
        }
        if (widgets.length === 0) {
            setSaveError("Adicione pelo menos um bloco antes de salvar.")
            return
        }

        setSaveError('')
        onSave({
            name: reportName,
            config: { widgets }
        })
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full pb-10">

            {/* Sidebar de Blocos Funcionais */}
            <div className="lg:col-span-1 border-r border-border pr-6 space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-4">Nome do Painel</h3>
                    <input
                        type="text"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        placeholder="Ex: Visão RH Semestral"
                        className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                </div>

                <div className="pt-4 border-t border-border">
                    <h3 className="font-semibold text-lg mb-2">Blocos Disponíveis</h3>
                    <p className="text-sm text-muted-foreground mb-4">Clique num bloco para adicionar à sua tela à direita.</p>
                    <div className="space-y-3">
                        {AVAILABLE_WIDGETS.map((aw, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAddWidget(aw)}
                                className="w-full flex items-center gap-3 p-3 text-left border border-border rounded-lg bg-card hover:border-primary/50 hover:bg-muted/50 transition-all group"
                            >
                                <PlusCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="font-medium text-sm text-foreground">{aw.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tela de Construção - Canvas DND */}
            <div className="lg:col-span-3 flex flex-col pl-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Design do Relatório
                    </h2>
                    <div className="flex gap-4 items-center">
                        {saveError && <span className="text-sm text-destructive font-medium">{saveError}</span>}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            {isAutoSaving || isSaving ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    Sincronizando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    Dashboard Sincronizado
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-muted/30 border border-border rounded-xl p-6 min-h-[400px]">
                    {widgets.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center">
                            <PieChart className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">O painel está vazio</p>
                            <p className="text-sm">Selecione blocos na barra lateral para começar a compor a visão.</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={widgets.map(w => w.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-4 max-w-2xl mx-auto">
                                    {widgets.map(w => (
                                        <SortableItem key={w.id} id={w.id} widget={w} onRemove={handleRemoveWidget} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>
        </div>
    )
}
