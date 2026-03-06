'use server'

import { getMyProfile } from '@/app/actions/me'
import { getMyPDIData } from '@/app/admin/actions/pdi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    User,
    Briefcase,
    MapPin,
    Building2,
    ShieldCheck,
    ChevronRight,
    Target,
    Zap,
    ArrowLeft,
    Clock,
    Award,
    ClipboardList,
    CheckCircle2,
    Star
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist'
import { getUserBadges } from '@/app/admin/actions/gamification'
import { UserBadges } from '@/components/gamification/UserBadges'
import { suggestPDIImprovement } from '@/app/admin/actions/analytics'
import { PDIAssistant } from '@/components/ai/PDIAssistant'
import { CultureAssistant } from '@/components/ai/CultureAssistant'
import { MFAManager } from '@/components/auth/MFAManager'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function MeuPerfilPage() {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const [profileRes, pdiDataRes, onboardingRes, badgesRes, suggestionsRes] = await Promise.all([
        getMyProfile(),
        getMyPDIData(),
        supabase
            .from('user_onboarding_progress')
            .select('*, onboarding_items(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true }),
        getUserBadges({ userId: user.id }),
        suggestPDIImprovement(user.id)
    ])

    if (!profileRes.success || !profileRes.data) {
        redirect('/login')
    }

    const profile = profileRes.data
    const pdi = pdiDataRes.data
    const onboarding = onboardingRes.data || []
    const onboardingTotal = onboarding.length
    const onboardingCompleted = onboarding.filter((i: any) => i.status === 'completed').length
    const onboardingPercent = onboardingTotal > 0 ? Math.round((onboardingCompleted / onboardingTotal) * 100) : 0
    const badges = badgesRes.data || []
    const pdiSuggestions = suggestionsRes.data || []
    const isPdiResData = Array.isArray(pdiSuggestions) // Segurança extra

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20">
            {/* Header / Nav */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b z-50 px-6 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Voltar ao Dashboard</span>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold tracking-tight">R</div>
                    <span className="font-bold text-slate-800 dark:text-white">Meu Perfil</span>
                </div>
            </nav>

            <main className="pt-24 px-6 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Hero Section */}
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 md:p-12">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full -ml-24 -mb-24 blur-3xl" />

                    <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-primary/20">
                            {profile.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{profile.full_name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                                <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 border-none flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    {profile.roles.name}
                                </Badge>
                                <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-green-50 text-green-600 border-none flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Ativo no Sistema
                                </Badge>
                            </div>
                            <p className="text-slate-500 max-w-2xl">Gestão de carreira e desenvolvimento individual. Acompanhe seu progresso e metas corporativas.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Professional Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                            <CardHeader className="pb-0 p-8 border-b border-slate-50">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                    Informações Profissionais
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cargo Atual</p>
                                    <h4 className="text-xl font-bold text-slate-800">{profile.positions?.title || 'Não Definido'}</h4>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nível Senioridade</p>
                                    <h4 className="text-xl font-bold text-slate-800">{profile.positions?.levels?.name || 'N/A'}</h4>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Organização</p>
                                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                                        <Building2 className="w-4 h-4 text-slate-400" />
                                        {profile.organizations.name}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unidade / Local</p>
                                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        {profile.units.name}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Onboarding Checklist (if active) */}
                        {onboardingTotal > 0 && onboardingPercent < 100 && (
                            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                                            <ClipboardList className="w-5 h-5 text-primary" />
                                            Meu Onboarding
                                        </CardTitle>
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                                            {onboardingPercent}% Concluído
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-0">
                                    <OnboardingChecklist items={onboarding} />
                                </CardContent>
                            </Card>
                        )}

                        {/* Segurança (MFA) */}
                        <MFAManager />

                        {/* Plano de Desenvolvimento (PDI) */}
                        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-500" />
                                    Plano de Desenvolvimento (PDI)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <PDIAssistant suggestions={pdiSuggestions} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                    {/* Conquistas / Gamificação */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-slate-800">Minhas Conquistas</h3>
                                        <UserBadges badges={badges} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Carreira / Progression */}
                        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-slate-900 text-white">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Award className="w-5 h-5 text-indigo-400" />
                                    Próximos Passos
                                </CardTitle>
                                <CardDescription className="text-slate-400">Status da sua jornada de crescimento na {profile.organizations.name}.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-4">
                                {pdi?.nextPosition ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10">
                                            <div>
                                                <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">
                                                    &quot;O PDI não é um destino, é uma jornada de melhoria contínua.&quot; – Atribua metas claras e revise-as periodicamente para garantir o crescimento sustentável da sua carreira.
                                                </p>
                                                <h4 className="text-2xl font-black">{pdi.nextPosition.title}</h4>
                                            </div>
                                            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
                                                <ChevronRight className="w-6 h-6" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-medium text-slate-300">Gaps de Competência Resolvidos</span>
                                                <span className="text-2xl font-black">65%</span>
                                            </div>
                                            <Progress value={65} className="h-2 bg-white/10" />
                                            <p className="text-xs text-slate-400 italic">Complete suas ações de PDI para reduzir os gaps para {pdi.nextPosition.title}.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                        <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                        <p className="text-sm text-slate-400">Você já atingiu o nível máximo da sua trilha ou ela não está configurada.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar: Ações Rápidas */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-6">
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white">Minhas Ações</h3>

                            <Link href="/dashboard/pdi" className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 group">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-bold text-sm">Ver Plano PDI</h5>
                                    <p className="text-[10px] text-slate-500">Ações de desenvolvimento</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <div className="flex items-center gap-4 p-4 rounded-3xl opacity-50 cursor-not-allowed">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-bold text-sm">Minhas Avaliações</h5>
                                    <p className="text-[10px] text-slate-500">Histórico de feedback</p>
                                </div>
                                <Badge className="bg-slate-100 text-slate-400 text-[9px] border-none uppercase">Em breve</Badge>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-3xl opacity-50 cursor-not-allowed">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-bold text-sm">Meu Histórico</h5>
                                    <p className="text-[10px] text-slate-500">Linha do tempo de carreira</p>
                                </div>
                                <Badge className="bg-slate-100 text-slate-400 text-[9px] border-none uppercase">Em breve</Badge>
                            </div>
                        </div>

                        {/* Dica do Dia / Mentor */}
                        <div className="bg-gradient-to-br from-indigo-600 to-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-110 transition-transform">
                                <Award className="w-16 h-16" />
                            </div>
                            <h4 className="text-xl font-bold mb-3 relative z-10">Dica de Carreira</h4>
                            <p className="text-indigo-100 text-sm italic relative z-10">"O aprendizado constante é a única forma de se manter relevante em um mercado que muda todos os dias. Foque no seu PDI!"</p>
                        </div>
                    </div>
                </div>
            </main>
            <CultureAssistant />
        </div>
    )
}
