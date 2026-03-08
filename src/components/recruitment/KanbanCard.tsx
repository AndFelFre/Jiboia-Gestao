'use client'

import React from 'react'
import { Candidate } from '@/services/recruitment/candidates'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MoreVertical, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface KanbanCardProps {
    candidate: Candidate
}

export function KanbanCard({ candidate }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: candidate.id,
        data: {
            type: 'Candidate',
            candidate,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const fitScoreColor =
        !candidate.fit_score ? 'bg-muted text-muted-foreground' :
            candidate.fit_score >= 80 ? 'bg-green-500/10 text-green-600' :
                candidate.fit_score >= 60 ? 'bg-yellow-500/10 text-yellow-600' :
                    'bg-destructive/10 text-destructive'

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-card border-2 border-primary/50 opacity-50 rounded-lg p-4 shadow-sm h-32"
            />
        )
    }

    const initials = candidate.full_name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-card border border-border rounded-lg p-4 shadow-sm hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing group relative flex flex-col gap-3"
        >
            <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs flex-shrink-0">
                        {initials}
                    </div>
                    <div className="overflow-hidden">
                        <Link href={`/recruitment/candidates/${candidate.id}`} className="font-medium text-sm text-foreground hover:text-primary truncate block" onPointerDown={(e) => e.stopPropagation()}>
                            {candidate.full_name}
                        </Link>
                        {candidate.jobs && (
                            <p className="text-xs text-muted-foreground truncate">{candidate.jobs.title}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center mt-1">
                    <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" onPointerDown={(e) => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${fitScoreColor}`}>
                    {candidate.fit_score ? `${candidate.fit_score.toFixed(1)} Fit` : 'S/ Nota'}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground" title={`Entrou nesta etapa em ${format(new Date(candidate.stage_changed_at || candidate.created_at), 'dd/MM/yyyy')}`}>
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(candidate.stage_changed_at || candidate.created_at), 'dd/MM')}</span>
                </div>
            </div>
        </div>
    )
}
