'use client'

import { useState } from 'react'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Search, User as UserIcon, Calendar, TrendingUp, AlertTriangle, CheckCircle, ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface AnalyticsUser {
    id: string
    name: string
    role: string
    leaderName: string | null
    daysInHouse: number
    progress: number
    expected: number
    status: 'on_track' | 'lagging'
}

interface OnboardingStatusTableProps {
    users: AnalyticsUser[]
}

export function OnboardingStatusTable({ users }: OnboardingStatusTableProps) {
    const [search, setSearch] = useState('')

    const filteredUsers = users
        .filter(u =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            (u.leaderName?.toLowerCase().includes(search.toLowerCase()) ?? false)
        )
        .sort((a, b) => {
            // Priorizar lagging e depois por mais dias de casa
            if (a.status !== b.status) return a.status === 'lagging' ? -1 : 1
            return b.daysInHouse - a.daysInHouse
        })

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por colaborador ou líder..."
                        className="pl-10 border-none bg-slate-50 dark:bg-slate-800 rounded-xl focus-visible:ring-1 focus-visible:ring-primary h-11"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                        <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                            <TableHead className="font-bold text-slate-800 dark:text-slate-200 h-14">Colaborador</TableHead>
                            <TableHead className="font-bold text-slate-800 dark:text-slate-200 h-14">Líder</TableHead>
                            <TableHead className="font-bold text-slate-800 dark:text-slate-200 h-14 text-center">Dias</TableHead>
                            <TableHead className="font-bold text-slate-800 dark:text-slate-200 h-14">Progresso</TableHead>
                            <TableHead className="font-bold text-slate-800 dark:text-slate-200 h-14 text-center">Status</TableHead>
                            <TableHead className="h-14"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                                    Nenhum colaborador encontrado nesta Cohort.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="border-slate-100 dark:border-slate-800 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <UserIcon className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white leading-tight">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.role}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {user.leaderName || <span className="text-slate-300">Não atribuído</span>}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                                            <Calendar className="w-3.5 h-3.5" />
                                            D{user.daysInHouse}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1.5 w-full max-w-[120px]">
                                            <div className="flex justify-between text-[10px] font-bold">
                                                <span className="text-indigo-600">{user.progress}%</span>
                                                <span className="text-slate-400 italic">Esp: {user.expected}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${user.status === 'lagging' ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                                    style={{ width: `${user.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className={`
                                            rounded-full border-none px-3 font-bold 
                                            ${user.status === 'lagging'
                                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                                                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}
                                        `}>
                                            <div className="flex items-center gap-1.5">
                                                {user.status === 'lagging' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                                {user.status === 'lagging' ? 'Lagging' : 'On Track'}
                                            </div>
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/users/${user.id}`}>
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all cursor-pointer">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
