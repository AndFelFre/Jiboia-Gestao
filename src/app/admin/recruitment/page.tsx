'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getJobs } from '../actions/recruitment-jobs'
import { getCandidates } from '../actions/recruitment-candidates'
import { getRecruitmentStats, type RecruitmentStats } from '../actions/analytics'
import { EmptyState } from '@/components/ui/feedback'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import {
    Plus,
    LayoutGrid,
    Users,
    Briefcase,
    Timer,
    ChevronRight,
    ArrowUpRight,
    Filter,
    Search as SearchIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RecruitmentPage() {
    const [loading, setLoading] = useState(true)
    const [jobs, setJobs] = useState<any[]>([])
    const [candidates, setCandidates] = useState<any[]>([])
    const [stats, setStats] = useState<RecruitmentStats | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const [jobsRes, candidatesRes, statsRes] = await Promise.all([
            getJobs(),
            getCandidates(),
            getRecruitmentStats()
        ])

        if (jobsRes.success) setJobs(jobsRes.data || [])
        if (candidatesRes.success) setCandidates(candidatesRes.data || [])
        if (statsRes.success) setStats(statsRes.data || null)

        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
                <Briefcase className="w-12 h-12 text-primary animate-bounce" />
                <p className="text-sm font-black text-slate-400 animate-pulse uppercase tracking-[0.3em]">Sincronizando Talent Pipeline...</p>
            </div>
        )
    }

    const openJobs = jobs.filter(j => j.status === 'open')

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Premium */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform flex items-center gap-2">
                            ← Back to Control Panel
                        </Link>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <Briefcase className="w-10 h-10 text-primary" />
                        Recrutamento & Seleção
                    </h1>
                    <p className="text-slate-400 mt-2 uppercase text-xs font-black tracking-[0.2em]">Gestão Estratégica de Aquisição de Talentos</p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <Button asChild variant="ghost" className="rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-900 hover:text-white gap-3 h-14 px-8 font-black uppercase tracking-widest text-[10px] transition-all">
                        <Link href="/admin/recruitment/kanban">
                            <LayoutGrid className="w-4 h-4" /> Visualização Kanban
                        </Link>
                    </Button>
                    <Button asChild className="rounded-2xl h-14 px-8 bg-primary hover:bg-slate-900 text-white transition-all font-black uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-primary/20">
                        <Link href="/admin/recruitment/jobs/new">
                            <Plus className="w-4 h-4" /> Nova Vaga
                        </Link>
                    </Button>
                </div>
            </header>

            {/* KPI Analytics Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Vagas Abertas', value: openJobs.length, icon: Briefcase, color: 'indigo', sub: 'Oportunidades ativas' },
                    { label: 'Total Candidatos', value: candidates.length, icon: Users, color: 'blue', sub: 'No pipeline atual' },
                    { label: 'Time to Hire', value: `${stats?.timeToHireAvg || 0}d`, icon: Timer, color: 'orange', sub: 'Média de fechamento' },
                    { label: 'Contratados', value: stats?.totalHired || 0, icon: ArrowUpRight, color: 'emerald', sub: 'Ciclo atual' }
                ].map((kpi, idx) => (
                    <Card key={idx} className="border-none shadow-sm bg-white rounded-[2.5rem] p-8 hover:shadow-xl transition-all duration-500 group overflow-hidden border-b-4 hover:border-b-primary">
                        <div className="flex items-center justify-between mb-6">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                kpi.color === 'indigo' ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white" :
                                    kpi.color === 'blue' ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" :
                                        kpi.color === 'orange' ? "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white" :
                                            "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                            )}>
                                <kpi.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-2">{kpi.value}</h3>
                        <p className="text-xs font-medium text-slate-400">{kpi.sub}</p>
                    </Card>
                ))}
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-2xl font-black text-slate-900">Vagas em Destaque</h2>
                    <Button asChild variant="link" className="text-primary font-black uppercase text-[10px] tracking-widest gap-2">
                        <Link href="/admin/recruitment/jobs">Ver todo o inventário <ChevronRight className="w-3 h-3" /></Link>
                    </Button>
                </div>

                {jobs.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center text-center">
                        <Briefcase className="w-16 h-16 text-slate-200 mb-6" />
                        <h3 className="text-xl font-black text-slate-900 mb-2">Sem vagas ativas no momento</h3>
                        <p className="text-slate-400 font-medium max-w-sm mb-8">Inicie um novo processo seletivo para atrair os melhores talentos para sua organização.</p>
                        <Button asChild className="rounded-2xl h-14 px-10 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]">
                            <Link href="/admin/recruitment/jobs/new">Criar Primeira Vaga</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {jobs.filter(j => j.status !== 'closed').map((job) => (
                            <Card key={job.id} className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 group border-b-8 border-transparent hover:border-primary/20">
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge className={cn(
                                            "rounded-lg border-none px-3 py-1 font-black uppercase text-[10px] tracking-widest",
                                            job.priority === 'urgent' ? 'bg-rose-50 text-rose-600' :
                                                job.priority === 'high' ? 'bg-orange-50 text-orange-600' :
                                                    'bg-indigo-50 text-indigo-600'
                                        )}>
                                            {job.priority === 'urgent' ? 'Urgente' : job.priority === 'high' ? 'Prioritária' : 'Normal'}
                                        </Badge>
                                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                                            <Users className="w-3 h-3" />
                                            {candidates.filter(c => c.job_id === job.id).length} candidatos
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{job.title}</CardTitle>
                                    <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest mt-2">
                                        {job.location || 'Híbrido'} • {job.employment_type || 'CLT'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-4">
                                    <div className="h-px bg-slate-50 w-full mb-6" />
                                    <Button asChild className="w-full rounded-2xl h-12 bg-slate-50 hover:bg-slate-900 text-slate-900 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all">
                                        <Link href={`/admin/recruitment/jobs/${job.id}`}>Gerenciar Vaga</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Recruitment Insight */}
            <div className="relative p-10 bg-slate-900 rounded-[3rem] text-white overflow-hidden shadow-2xl shadow-slate-900/20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mt-24 -ml-24"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-20 h-20 bg-indigo-500/20 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center border border-indigo-500/30 shrink-0 shadow-lg shadow-indigo-500/20">
                        <SearchIcon className="w-10 h-10 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-2xl font-black mb-3">Health Check do Funil</h4>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-3xl">
                            O tempo médio de contratação está em <span className="text-white font-bold">{stats?.timeToHireAvg || 0} dias</span>.
                            Detectamos que a etapa de <span className="text-indigo-400 font-bold">Triagem Técnico</span> é o atual gargalo, onde os candidatos permanecem em média 8 dias.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-2xl h-14 px-8 border-slate-700 hover:bg-white hover:text-slate-900 transition-all font-black uppercase tracking-widest text-[10px] gap-3">
                        <Link href="/admin/analytics/recruitment">Analytics Detalhado</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
