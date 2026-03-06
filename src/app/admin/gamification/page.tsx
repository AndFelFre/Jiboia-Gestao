'use client'

import { useState, useEffect } from 'react'
import { getBadges, createBadge, awardBadge, Badge, getLeaderboard, LeaderboardEntry } from '../actions/gamification'
import { getUsers } from '../actions/users'
import { Leaderboard } from '@/components/gamification/Leaderboard'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Award,
    Plus,
    Star,
    Users as UsersIcon,
    Search,
    Loader2,
    CheckCircle2,
    Trophy,
    Target
} from 'lucide-react'
import { Badge as UIBadge } from '@/components/ui/badge'

export default function GamificationAdminPage() {
    const [badges, setBadges] = useState<Badge[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [isActionLoading, setIsActionLoading] = useState(false)

    // Form states
    const [newBadge, setNewBadge] = useState({ name: '', description: '', icon: 'Award', color: 'blue', type: 'achievement' as const })
    const [awardData, setAwardData] = useState({ userId: '', badgeId: '', comment: '' })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const [bRes, uRes, lRes] = await Promise.all([getBadges({}), getUsers(), getLeaderboard({})])

        // Se não houver medalhas, tenta criar as padrão
        if (bRes.success && (!bRes.data || bRes.data.length === 0)) {
            const { seedDefaultBadges } = await import('../actions/gamification')
            await seedDefaultBadges({})
            const retryRes = await getBadges({})
            if (retryRes.success) setBadges(retryRes.data || [])
        } else if (bRes.success) {
            setBadges(bRes.data || [])
        }

        if (uRes.success) setUsers(uRes.data || [])
        if (lRes.success) setLeaderboard(lRes.data || [])
        setLoading(false)
    }

    async function handleCreateBadge() {
        if (!newBadge.name) return
        setIsActionLoading(true)
        const res = await createBadge(newBadge)
        if (res.success) {
            setNewBadge({ name: '', description: '', icon: 'Award', color: 'blue', type: 'achievement' as const })
            await loadData()
        }
        setIsActionLoading(false)
    }

    async function handleAwardBadge() {
        if (!awardData.userId || !awardData.badgeId) return
        setIsActionLoading(true)
        const res = await awardBadge({ userId: awardData.userId, badgeId: awardData.badgeId, comment: awardData.comment })
        if (res.success) {
            setAwardData({ userId: '', badgeId: '', comment: '' })
            alert('Medalha concedida com sucesso!')
        } else {
            alert(res.error)
        }
        setIsActionLoading(false)
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-amber-500" />
                        Gamificação & Reconhecimento
                    </h1>
                    <p className="text-slate-500 mt-1 uppercase text-xs font-bold tracking-widest">Gestão de Engajamento e Medalhas</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Criar Nova Medalha */}
                <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" />
                            Criar Nova Medalha
                        </CardTitle>
                        <CardDescription>Adicione um novo tipo de reconhecimento ao catálogo.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Nome da Medalha</Label>
                            <Input
                                placeholder="Ex: Estrela do Mês"
                                value={newBadge.name}
                                onChange={e => setNewBadge({ ...newBadge, name: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase text-slate-400">Descrição/Critério</Label>
                            <Input
                                placeholder="O que o colaborador fez para ganhar?"
                                value={newBadge.description}
                                onChange={e => setNewBadge({ ...newBadge, description: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase text-slate-400">Cor</Label>
                                <select
                                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                                    value={newBadge.color}
                                    onChange={e => setNewBadge({ ...newBadge, color: e.target.value })}
                                >
                                    <option value="blue">Azul (Padrão)</option>
                                    <option value="gold">Dourado (Elite)</option>
                                    <option value="silver">Prata (Avançado)</option>
                                    <option value="bronze">Bronze (Iniciante)</option>
                                    <option value="purple">Roxo (Cultura)</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    className="w-full rounded-xl h-10 shadow-lg"
                                    onClick={handleCreateBadge}
                                    disabled={isActionLoading || !newBadge.name}
                                >
                                    {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Medalha'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Atribuir Medalha */}
                <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-slate-900 text-white">
                    <CardHeader className="p-8 border-b border-white/10">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-400" />
                            Atribuir Reconhecimento
                        </CardTitle>
                        <CardDescription className="text-slate-400">Conceda uma medalha para um colaborador específico.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase text-slate-500">Selecionar Colaborador</Label>
                            <select
                                className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
                                value={awardData.userId}
                                onChange={e => setAwardData({ ...awardData, userId: e.target.value })}
                            >
                                <option value="" className="text-slate-900">Selecione um usuário...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id} className="text-slate-900">{u.full_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase text-slate-500">Selecionar Medalha</Label>
                            <select
                                className="w-full h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
                                value={awardData.badgeId}
                                onChange={e => setAwardData({ ...awardData, badgeId: e.target.value })}
                            >
                                <option value="" className="text-slate-900">Selecione uma medalha...</option>
                                {badges.map(b => (
                                    <option key={b.id} value={b.id} className="text-slate-900">{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase text-slate-500">Comentário (Opcional)</Label>
                            <Input
                                placeholder="Parabéns pela entrega épica!"
                                className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                                value={awardData.comment}
                                onChange={e => setAwardData({ ...awardData, comment: e.target.value })}
                            />
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full rounded-xl h-11 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold"
                            onClick={handleAwardBadge}
                            disabled={isActionLoading || !awardData.userId || !awardData.badgeId}
                        >
                            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Conceder Medalha'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
                {/* 3. Catálogo de Medalhas */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold uppercase text-slate-400 tracking-tighter px-2">Catálogo de Medalhas Ativas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {badges.map(b => (
                            <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:border-primary/50 transition-all shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3 group-hover:scale-110 transition-transform">
                                    <Award className="w-6 h-6" />
                                </div>
                                <h4 className="text-xs font-black uppercase text-slate-800 tracking-tight">{b.name}</h4>
                                <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">{b.description}</p>
                            </div>
                        ))}
                        {badges.length === 0 && !loading && (
                            <div className="col-span-full py-12 text-center text-slate-400 italic bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                Nenhuma medalha cadastrada. Comece criando uma acima!
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Leaderboard / Ranking */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase text-slate-400 tracking-tighter px-2">Ranking de Aprendizado (XP)</h3>
                    <Leaderboard entries={leaderboard.slice(0, 10)} />
                </div>
            </div>
        </div >
    )
}
