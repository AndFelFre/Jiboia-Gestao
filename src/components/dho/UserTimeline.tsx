'use client'

import { TimelineEvent } from '@/app/admin/actions/dho-timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Briefcase, Building, CheckCircle, Clock, UserPlus, Flag, Target, Award } from 'lucide-react'

// Simple icon map based on string returned from action
const IconMap: Record<string, any> = {
    UserPlus: UserPlus,
    Briefcase: Briefcase,
    Building: Building,
    CheckCircle: CheckCircle,
    Clock: Clock,
    Flag: Flag,
    Target: Target,
    Award: Award,
}

const colorMap = {
    high: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    medium: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    low: 'bg-slate-50 text-slate-600 border-slate-200',
}

interface UserTimelineProps {
    events: TimelineEvent[]
}

export function UserTimeline({ events }: UserTimelineProps) {
    if (!events || events.length === 0) {
        return (
            <Card className="border-slate-200 shadow-sm rounded-2xl">
                <CardContent className="p-8 text-center text-slate-500">
                    <Clock className="w-12 h-12 mx-auto opacity-20 mb-4" />
                    <p className="text-sm font-medium">Nenhum evento registrado ainda.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    Timeline do Colaborador
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="relative border-l border-slate-200 ml-4 space-y-6">
                    {events.map((event, index) => {
                        const Icon = IconMap[event.icon] || Clock
                        const isLast = index === events.length - 1

                        return (
                            <div key={event.id} className="relative pl-6">
                                <span className={`absolute -left-[18px] top-1 h-9 w-9 flex items-center justify-center rounded-full border-2 bg-white ${colorMap[event.priority]} shadow-sm`}>
                                    <Icon className="w-4 h-4" />
                                </span>

                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">{event.title}</h4>
                                        {event.description && (
                                            <p className="text-xs text-slate-500 mt-1.5">{event.description}</p>
                                        )}
                                        {event.actor && (
                                            <p className="text-[10px] font-medium text-slate-400 mt-2 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                Registrado por {event.actor}
                                            </p>
                                        )}
                                    </div>
                                    <time className="text-xs font-semibold text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                        {format(new Date(event.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                    </time>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
