'use client'

import React from 'react'
import { PerformanceEvaluation, NineBoxQuadrant } from '@/types'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { User } from 'lucide-react'
import Image from 'next/image'

interface NineBoxMatrixGridProps {
    data: (PerformanceEvaluation & { users: { full_name: string; avatar_url?: string; email: string } })[]
}

const QUADRANTS: { id: NineBoxQuadrant; label: string; color: string; description: string; x: number; y: number }[] = [
    { id: 'star', label: 'Estrela', color: 'bg-emerald-500', description: 'Alto Desempenho e Alto Potencial', x: 3, y: 3 },
    { id: 'rising_star', label: 'Estrela em Ascensão', color: 'bg-emerald-400', description: 'Médio Desempenho e Alto Potencial', x: 2, y: 3 },
    { id: 'dilemma', label: 'Dilema', color: 'bg-yellow-400', description: 'Baixo Desempenho e Alto Potencial', x: 1, y: 3 },

    { id: 'future_star', label: 'Futura Estrela', color: 'bg-blue-500', description: 'Alto Desempenho e Médio Potencial', x: 3, y: 2 },
    { id: 'critical_keeper', label: 'Mantenedor Crítico', color: 'bg-blue-400', description: 'Médio Desempenho e Médio Potencial', x: 2, y: 2 },
    { id: 'questionable', label: 'Questionável', color: 'bg-orange-400', description: 'Baixo Desempenho e Médio Potencial', x: 1, y: 2 },

    { id: 'solid_professional', label: 'Profissional Sólido', color: 'bg-slate-500', description: 'Alto Desempenho e Baixo Potencial', x: 3, y: 1 },
    { id: 'effective_specialist', label: 'Especialista Eficaz', color: 'bg-slate-400', description: 'Médio Desempenho e Baixo Potencial', x: 2, y: 1 },
    { id: 'risk', label: 'Risco', color: 'bg-red-500', description: 'Baixo Desempenho e Baixo Potencial', x: 1, y: 1 },
]

export function NineBoxMatrixGrid({ data }: NineBoxMatrixGridProps) {
    return (
        <div className="w-full space-y-4">
            <div className="grid grid-cols-3 gap-2 aspect-square max-w-2xl mx-auto border-2 border-slate-200 p-2 rounded-2xl bg-slate-50 relative">
                {/* Labels dos Eixos */}
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    Potencial <div className="w-12 h-px bg-slate-200" />
                </div>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    Desempenho <div className="w-12 h-px bg-slate-200" />
                </div>

                {/* Quadrantes (Ordenados por Y decrescente para grid 3x3 correto) */}
                {[3, 2, 1].map(y => (
                    [1, 2, 3].map(x => {
                        const quad = QUADRANTS.find(q => q.x === x && q.y === y)!
                        const usersInQuad = data.filter(d => d.nine_box_quadrant === quad.id)

                        return (
                            <div
                                key={quad.id}
                                className={cn(
                                    "relative rounded-xl border-2 border-dashed border-slate-200 flex flex-col p-2 min-h-0",
                                    usersInQuad.length > 0 ? "bg-white border-solid shadow-sm" : "bg-transparent"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400 truncate pr-1">
                                        {quad.label}
                                    </span>
                                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", quad.color)} />
                                </div>

                                <div className="flex flex-wrap gap-1 overflow-y-auto max-h-[120px] scrollbar-hide">
                                    <TooltipProvider>
                                        {usersInQuad.map((u) => (
                                            <Tooltip key={u.id}>
                                                <TooltipTrigger asChild>
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-help hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-sm overflow-hidden shrink-0">
                                                        {u.users.avatar_url ? (
                                                            <Image
                                                                src={u.users.avatar_url}
                                                                alt={u.users.full_name}
                                                                width={32}
                                                                height={32}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="p-2 bg-slate-900 text-white border-none rounded-lg shadow-xl">
                                                    <p className="text-xs font-black">{u.users.full_name}</p>
                                                    <p className="text-[10px] opacity-70">P:{u.performance_bucket} / Y:{u.potential_score}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ))}
                                    </TooltipProvider>
                                </div>

                                {usersInQuad.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                        <div className={cn("w-full h-full rounded-lg", quad.color)} />
                                    </div>
                                )}
                            </div>
                        )
                    })
                ))}
            </div>
        </div>
    )
}
