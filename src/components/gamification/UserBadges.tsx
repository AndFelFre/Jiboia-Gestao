'use client'

import { UserBadge } from '@/app/admin/actions/gamification'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip'
import { Award, Info, Star } from 'lucide-react'

interface UserBadgesProps {
    badges: any[]
}

const colorMap: any = {
    blue: 'bg-blue-500/20 text-blue-600 border-blue-200',
    gold: 'bg-amber-500/20 text-amber-600 border-amber-300',
    silver: 'bg-slate-300/20 text-slate-600 border-slate-300',
    bronze: 'bg-orange-400/20 text-orange-700 border-orange-300',
    purple: 'bg-purple-500/20 text-purple-600 border-purple-300',
}

export function UserBadges({ badges }: UserBadgesProps) {
    if (badges.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-100 rounded-[2rem] opacity-40">
                <Star className="w-10 h-10 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Nenhuma medalha ainda</p>
                <p className="text-[10px]">As conquistas aparecerão aqui.</p>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="flex flex-wrap gap-4">
                {badges.map((ub) => (
                    <Tooltip key={ub.id}>
                        <TooltipTrigger asChild>
                            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center cursor-help transition-transform hover:scale-110 shadow-sm ${colorMap[ub.badges?.color || 'blue']}`}>
                                {/* Aqui poderíamos mapear o nome do ícone para o componente Lucide Real */}
                                <Award className="w-7 h-7" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 text-white p-4 border-none shadow-2xl rounded-xl max-w-xs">
                            <div className="space-y-1">
                                <p className="font-black text-sm uppercase tracking-tight">{ub.badges?.name}</p>
                                <p className="text-[10px] text-slate-400 leading-relaxed">{ub.badges?.description}</p>
                                <div className="pt-2 mt-2 border-t border-white/10">
                                    <p className="text-[9px] font-bold uppercase text-slate-500">Concedida por:</p>
                                    <p className="text-[10px] text-slate-300">{ub.awarded_by_name || 'Sistema'}</p>
                                    {ub.comment && (
                                        <p className="text-[10px] italic text-slate-400 mt-1">"{ub.comment}"</p>
                                    )}
                                    <p className="text-[10px] text-slate-400 mt-2">"Toda grande jornada começa com uma pequena conquista." – Continue se dedicando para desbloquear novas conquistas.</p>
                                </div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    )
}
