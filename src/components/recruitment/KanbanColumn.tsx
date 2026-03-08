'use client'

import React from 'react'
import { Candidate } from '@/services/recruitment/candidates'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
    id: string
    title: string
    candidates: Candidate[]
}

export function KanbanColumn({ id, title, candidates }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
        data: {
            type: 'Column',
            stage: id,
        },
    })

    return (
        <div className="flex flex-col bg-muted/40 border border-border rounded-xl h-full w-[350px] min-w-[350px] max-w-[350px] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border bg-card flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    {title}
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                        {candidates.length}
                    </span>
                </h3>
            </div>

            {/* Droppable Area / Scrollable Content */}
            <div
                ref={setNodeRef}
                className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px]"
            >
                <SortableContext
                    items={candidates.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {candidates.map(candidate => (
                        <KanbanCard key={candidate.id} candidate={candidate} />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}
