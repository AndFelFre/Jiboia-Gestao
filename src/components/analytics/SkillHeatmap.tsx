'use client'

import { SkillHeatmapData } from '@/app/admin/actions/analytics'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../ui/tooltip'

interface SkillHeatmapProps {
    data: SkillHeatmapData
}

export function SkillHeatmap({ data }: SkillHeatmapProps) {
    const { skills, users, matrix } = data

    const getScoreColor = (score: number, gap: number) => {
        if (gap > 0) return 'bg-red-500/20 text-red-700 border-red-200'
        if (score >= 4) return 'bg-emerald-500/20 text-emerald-700 border-emerald-200'
        if (score >= 3) return 'bg-blue-500/20 text-blue-700 border-blue-200'
        if (score >= 2) return 'bg-amber-500/10 text-amber-700 border-amber-200'
        return 'bg-slate-100 text-slate-400 border-slate-100'
    }

    return (
        <TooltipProvider>
            <div className="overflow-x-auto pb-6">
                <table className="w-full border-separate border-spacing-2">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-20 bg-white/80 backdrop-blur-sm p-4 text-left min-w-[200px]">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Colaborador / Skill</span>
                            </th>
                            {skills.map((skill: any) => (
                                <th key={skill.id} className="p-4 text-center min-w-[120px]">
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{skill.name}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user: any) => (
                            <tr key={user.id} className="group">
                                <td className="sticky left-0 z-20 bg-white/80 backdrop-blur-sm p-4 border rounded-2xl shadow-sm transition-all group-hover:bg-slate-50">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">{user.name}</span>
                                        <span className="text-[10px] text-slate-400 font-medium uppercase">{user.position}</span>
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
                                                    <div className={`w-full h-16 border rounded-2xl flex flex-col items-center justify-center transition-all cursor-help ${getScoreColor(score, gap)}`}>
                                                        <span className="text-lg font-black">{score || '-'}</span>
                                                        {gap > 0 && (
                                                            <div className="mt-1 flex gap-0.5">
                                                                {Array.from({ length: gap }).map((_, i) => (
                                                                    <div key={i} className="w-1 h-1 rounded-full bg-red-500" />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 text-white border-none p-4 rounded-xl shadow-2xl">
                                                    <p className="font-bold">{user.name}</p>
                                                    <p className="text-xs text-slate-400 mb-2">{skill.name}</p>
                                                    <div className="space-y-1 pt-2 border-t border-white/10">
                                                        <div className="flex justify-between gap-4">
                                                            <span className="text-xs">Nota Atual:</span>
                                                            <span className="text-xs font-bold">{score}</span>
                                                        </div>
                                                        {gap > 0 && (
                                                            <div className="flex justify-between gap-4">
                                                                <span className="text-xs text-red-400">Gap Encontrado:</span>
                                                                <span className="text-xs font-bold text-red-400">-{gap}</span>
                                                            </div>
                                                        )}
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
