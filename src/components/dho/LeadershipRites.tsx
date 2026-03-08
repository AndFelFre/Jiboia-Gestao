'use client'

import React from 'react'
import {
    MessagesSquare,
    Star,
    Flag,
    Calendar,
    CheckCircle2,
    Clock,
    Plus,
    MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PDIItem, DHORiteType } from '@/types'

import { AddRiteModal } from './AddRiteModal'

interface LeadershipRitesProps {
    rites: PDIItem[]
    userId: string
    userName: string
}

const RITE_CONFIG: Record<DHORiteType, { label: string; icon: any; color: string; bgColor: string }> = {
    one_on_one: {
        label: '1:1',
        icon: MessagesSquare,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-100'
    },
    feedback: {
        label: 'Feedback',
        icon: Star,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-100'
    },
    checkpoint: {
        label: 'Checkpoint',
        icon: Flag,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 border-indigo-100'
    }
}

export function LeadershipRites({ rites, userId, userName }: LeadershipRitesProps) {
    return (
        <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between space-y-0 py-4 px-6">
                <div>
                    <CardTitle className="text-base font-black text-slate-800 tracking-tight uppercase">Ritos de Liderança</CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-500">Histórico de acompanhamento e feedbacks</CardDescription>
                </div>
                <AddRiteModal userId={userId} userName={userName} />
            </CardHeader>
            <CardContent className="p-0">
                {rites.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Clock className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-400 font-medium">Nenhum rito registrado ainda.</p>
                        <p className="text-xs text-slate-400 mt-1 italic">Agende um 1:1 para iniciar o acompanhamento.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {rites.map((rite) => {
                            const config = RITE_CONFIG[rite.rite_type as DHORiteType] || RITE_CONFIG.one_on_one
                            const Icon = config.icon

                            return (
                                <div key={rite.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-start gap-4">
                                        <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", config.bgColor)}>
                                            <Icon className={cn("w-5 h-5", config.color)} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-slate-800">{rite.title}</h4>
                                                <Badge variant="outline" className="text-[10px] h-4 font-black uppercase tracking-wider py-0 px-1.5 border-slate-200 text-slate-500">
                                                    {config.label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {rite.deadline ? new Date(rite.deadline).toLocaleDateString('pt-BR') : 'Sem data'}
                                                </span>
                                                {rite.status === 'completed' ? (
                                                    <span className="flex items-center gap-1 text-emerald-600">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Concluído {rite.completed_at && `em ${new Date(rite.completed_at).toLocaleDateString('pt-BR')}`}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-amber-500">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Pendente
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
