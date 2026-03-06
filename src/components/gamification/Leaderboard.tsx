'use client'

import { LeaderboardEntry } from '@/app/admin/actions/gamification'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Medal, Star, Target, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface LeaderboardProps {
    entries: LeaderboardEntry[]
}

export function Leaderboard({ entries }: LeaderboardProps) {
    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="w-6 h-6 text-amber-500" />
            case 2: return <Medal className="w-6 h-6 text-slate-400" />
            case 3: return <Medal className="w-6 h-6 text-orange-600" />
            default: return <span className="text-sm font-black text-slate-400">#{rank}</span>
        }
    }

    const getRankStyles = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-amber-50 border-amber-200'
            case 2: return 'bg-slate-50 border-slate-200'
            case 3: return 'bg-orange-50 border-orange-200'
            default: return 'bg-white border-slate-100'
        }
    }

    return (
        <div className="space-y-4">
            {entries.map((entry) => (
                <div
                    key={entry.userId}
                    className={`flex items-center gap-4 p-6 rounded-[2rem] border transition-all hover:shadow-md ${getRankStyles(entry.rank)}`}
                >
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                        {getRankIcon(entry.rank)}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900">{entry.userName}</h4>
                            {entry.rank <= 3 && (
                                <Badge className="text-[9px] uppercase bg-slate-900 text-white border-none">Top {entry.rank}</Badge>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{entry.position}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="flex items-center gap-1 text-slate-400">
                                <Star className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase">Medalhas</span>
                            </div>
                            <p className="text-lg font-black text-slate-900">{entry.badgesCount}</p>
                        </div>

                        <div className="text-right min-w-[80px]">
                            <p className="text-[10px] font-bold uppercase text-primary tracking-tighter">XP TOTAL</p>
                            <p className="text-2xl font-black text-slate-900 leading-none">{entry.points}</p>
                        </div>
                    </div>
                </div>
            ))}

            {entries.length === 0 && (
                <div className="py-12 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-sm font-bold text-slate-400">Nenhum dado de ranking disponível ainda.</p>
                </div>
            )}
        </div>
    )
}
