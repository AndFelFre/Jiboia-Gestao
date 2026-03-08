'use client'

import React, { useState, useEffect } from 'react'
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DragOverlay,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Candidate, transitionCandidate } from '@/services/recruitment/candidates'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'

// Definição das colunas/estágios padrão
export const PIPELINE_STAGES = [
    { id: 'new', title: 'Novos' },
    { id: 'screening', title: 'Triagem' },
    { id: 'interview_1', title: 'Entrevista 1' },
    { id: 'interview_2', title: 'Entrevista 2' },
    { id: 'technical', title: 'Técnica' },
    { id: 'cultural', title: 'Cultural' },
    { id: 'offer', title: 'Proposta' },
    { id: 'hired', title: 'Contratado' },
    { id: 'rejected', title: 'Reprovado' },
]

interface KanbanBoardProps {
    initialCandidates: Candidate[]
}

export function KanbanBoard({ initialCandidates }: KanbanBoardProps) {
    const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
    const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Atualiza o state local se as props mudarem (ex: troca filtro de vaga)
    useEffect(() => {
        setCandidates(initialCandidates)
    }, [initialCandidates])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const candidate = candidates.find(c => c.id === active.id)
        if (candidate) setActiveCandidate(candidate)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        setCandidates(prev => {
            const activeIndex = prev.findIndex(c => c.id === activeId)
            const overIndex = prev.findIndex(c => c.id === overId)

            const activeItem = prev[activeIndex]
            const activeStage = activeItem.stage

            // Verifica se está soltando numa coluna vazia
            const isOverColumn = over.data.current?.type === 'Column'
            const overStage = isOverColumn ? over.id : prev[overIndex]?.stage

            if (activeStage !== overStage) {
                // Movendo para outra coluna
                const newCandidates = [...prev]
                newCandidates[activeIndex] = { ...activeItem, stage: overStage as string }
                // Coloca final da lista ao arrastar sobre coluna
                return arrayMove(newCandidates, activeIndex, isOverColumn ? newCandidates.length : overIndex)
            }

            // Mesma coluna: apenas reordena visualmente
            return arrayMove(prev, activeIndex, overIndex)
        })
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveCandidate(null)
        const { active, over } = event

        if (!over) return

        const activeId = active.id
        const overId = over.id
        const isOverColumn = over.data.current?.type === 'Column'
        const overStage = isOverColumn ? overId : candidates.find(c => c.id === overId)?.stage

        // Obter o candidato arrastado
        const candidate = candidates.find(c => c.id === activeId)

        // Se o estágio realmente mudou e temos o destino, disparamos pro backend
        // Detalhe: o stage visual (dragOver) já atualizou, mas se quiser garantir a Server Action...
        if (candidate && overStage && candidate.stage === overStage) {
            setIsSaving(true)
            try {
                const res = await transitionCandidate(candidate.id, overStage as string)
                if (!res.success) {
                    // Tratar erro / rollback visual
                    console.error('Falha ao salvar no BD:', res.error)
                }
            } finally {
                setIsSaving(false)
            }
        }
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[500px]">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                {PIPELINE_STAGES.map(stage => (
                    <KanbanColumn
                        key={stage.id}
                        id={stage.id}
                        title={stage.title}
                        candidates={candidates.filter(c => c.stage === stage.id)}
                    />
                ))}

                <DragOverlay>
                    {activeCandidate ? <KanbanCard candidate={activeCandidate} /> : null}
                </DragOverlay>
            </DndContext>

            {/* Loading invisivel no background pro server */}
            {isSaving && <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded shadow text-sm">Atualizando funil...</div>}
        </div>
    )
}
