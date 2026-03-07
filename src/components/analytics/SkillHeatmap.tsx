'use client'

import { SkillHeatmapData } from '@/app/admin/actions/analytics'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../ui/tooltip'
import { cn } from '@/lib/utils'

interface SkillHeatmapProps {
    data: SkillHeatmapData
}

export function SkillHeatmap({ data }: SkillHeatmapProps) {
    const { skills, users, matrix } = data

    const getScoreColor = (score: number, gap: number) => {
        if (gap > 0) return 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100 hover:border-rose-200 shadow-sm shadow-rose-100/50'
        if (score >= 4) return 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200'
        if (score >= 3) return 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200'
        if (score >= 2) return 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 hover:border-amber-200'
        return 'bg-slate-50 text-slate-400 border-slate-100'
    }

    return (
        <TooltipProvider>
            <div className="overflow-x-auto pb-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full border-separate border-spacing-3">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-30 bg-white/95 backdrop-blur-md p-6 text-left min-w-[280px] rounded-3xl border border-slate-100 shadow-sm">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Talentos / Competências</span>
                            </th>
                            {skills.map((skill: any) => (
                                <th key={skill.id} className="p-4 text-center min-w-[140px] group">
                                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-transparent group-hover:bg-white group-hover:border-slate-100 group-hover:shadow-sm transition-all duration-300">
                                        <span className="text-xs font-black text-slate-700 uppercase tracking-tighter block truncate">{skill.name}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="space-y-4">
                        {users.map((user: any) => (
                            <tr key={user.id} className="group/row">
                                <td className="sticky left-0 z-30 bg-white/95 backdrop-blur-md p-6 border border-slate-100 rounded-[2rem] shadow-sm transition-all duration-500 group-hover/row:bg-slate-900 group-hover/row:border-slate-800 group-hover/row:scale-[1.02] group-hover/row:z-40">
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900 group-hover/row:text-white transition-colors text-lg tracking-tight">{user.name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 group-hover/row:text-slate-500">{user.position}</span>
                                    </div>
                                </td>
                                {skills.map((skill: any) => {
                                    const cell = matrix.find((m: any) => m.userId === user.id && m.skillId === skill.id)
                                    const score = cell?.score || 0
                                    const gap = cell?.gap || 0

                                    return (
                                        <td key={skill.id} className="p-0">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className={cn(
                                                        "w-full h-24 border rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500 cursor-help relative group/cell",
                                                        getScoreColor(score, gap)
                                                    )}>
                                                        <span className="text-2xl font-black transition-transform group-hover/cell:scale-125">{score || '-'}</span>
                                                        {gap > 0 && (
                                                            <div className="mt-2 flex gap-1">
                                                                {Array.from({ length: gap }).map((_, i) => (
                                                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                                ))}
                                                            </div>
                                                        )}
                                                        {gap > 0 && (
                                                            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500" />
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 text-white border-slate-800 p-6 rounded-3xl shadow-2xl backdrop-blur-xl max-w-[240px]">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="font-black text-lg tracking-tight">{user.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{skill.name}</p>
                                                        </div>
                                                        <div className="h-px bg-white/10 w-full" />
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                                                                <span className="text-[10px] font-bold uppercase text-slate-400">Rating:</span>
                                                                <span className="text-sm font-black text-primary">{score} / 5</span>
                                                            </div>
                                                            {gap > 0 && (
                                                                <div className="flex justify-between items-center bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                                                                    <span className="text-[10px] font-bold uppercase text-rose-400">Skill Gap:</span>
                                                                    <span className="text-sm font-black text-rose-500">-{gap}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 italic mt-2">Clique para ver o PDI sugerido</p>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </TooltipProvider>
    )
}
