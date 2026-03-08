import { createServerSupabaseClientReadOnly } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  Users,
  Target,
  Zap,
  Settings,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Activity,
  Award,
  TrendingUp,
  MessageSquare
} from 'lucide-react'
import { CultureAssistant } from '@/components/ai/CultureAssistant'
import { PushNotificationManager } from '@/components/mobile/PushNotificationManager'
import { KudosBox } from '@/components/social/KudosBox'
import { SocialFeed } from '@/components/social/SocialFeed'
import { PulseSurveyCard } from '@/components/social/PulseSurveyCard'
import { seedDefaultPulseSurvey } from '@/app/actions/pulse'
import { DashboardSkeleton } from '@/components/ui/skeletons/DashboardSkeleton'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  await seedDefaultPulseSurvey({})
  const supabase = createServerSupabaseClientReadOnly()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData, error } = await supabase
    .from('users')
    .select(`
      id,
      org_id,
      unit_id,
      email,
      full_name,
      status,
      role:roles ( name )
    `)
    .eq('id', user.id)
    .maybeSingle()

  if (error || !userData) {
    console.error('Erro ou Perfil ausente:', error)
    return redirect('/login?error=account_not_found')
  }

  if (userData.status !== 'active') {
    redirect('/login?error=account_inactive')
  }

  const roleData = userData.role as any
  const roleName = Array.isArray(roleData)
    ? (roleData.length > 0 ? roleData[0]?.name : 'N/A')
    : (roleData?.name || 'N/A')

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-10">
        {/* Header Corporativo */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-corporate-primary tracking-tight">Dashboard Central</h2>
            <p className="text-muted-foreground font-medium mt-1">Visão estratégica e operacional de {userData.full_name}.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-bento border border-border-bento-subtle rounded-2xl shadow-sm text-xs font-bold text-corporate-primary">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sessão Ativa: {userData.role ? roleName.toUpperCase() : 'USER'}
          </div>
        </header>

        {/* Bento Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card de Status - Destaque (2 colunas) */}
          <div className="md:col-span-2 order-first bg-surface-bento border border-border-bento-subtle p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center gap-3 text-corporate-primary mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status do Talent</span>
              </div>
              <div>
                <h3 className="text-3xl font-black text-corporate-primary capitalize mb-2">{userData.status}</h3>
                <p className="text-sm text-muted-foreground font-medium max-w-xs">Seu perfil está verificado e sincronizado com as políticas da organização.</p>
              </div>
            </div>
            <ShieldCheck className="absolute -bottom-6 -right-6 w-32 h-32 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* Unidade (1 coluna) */}
          <div className="bg-surface-bento border border-border-bento-subtle p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
            <div className="flex flex-col h-full justify-between relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Unidade</p>
              <div className="flex items-end gap-3">
                <MapPin className="w-6 h-6 text-primary mb-1" />
                <h3 className="text-xl font-bold text-corporate-primary truncate">
                  {userData.unit_id?.slice(0, 15) || 'Sede Principal'}
                </h3>
              </div>
            </div>
          </div>

          {/* Acesso (1 coluna) */}
          <div className="bg-surface-bento border border-border-bento-subtle p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
            <div className="flex flex-col h-full justify-between relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Nível de Acesso</p>
              <div className="flex items-end gap-3">
                <Activity className="w-6 h-6 text-primary mb-1" />
                <h3 className="text-xl font-bold text-corporate-primary">
                  {userData.org_id ? 'Corporativo' : 'Individual'}
                </h3>
              </div>
            </div>
          </div>

          {/* Módulos Principais - Grid 2x2 interno ou cards grandes */}
          <Link href="/admin/recruitment" className="md:col-span-2 group bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-black">Recrutamento</h4>
                <p className="text-white/60 mt-2 text-sm max-w-[300px]">Gestão estratégica de vagas e pipeline de talentos STAR.</p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all text-primary">
                Acessar Módulo <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50" />
          </Link>

          <Link href="/admin/performance/evaluations" className="md:col-span-2 group bg-surface-bento border border-border-bento-subtle p-8 rounded-[2.5rem] text-corporate-primary relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 border border-primary/10">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-2xl font-black">Performance</h4>
                <p className="text-muted-foreground mt-2 text-sm max-w-[300px]">Ciclos de avaliação, competências e feedback 360°.</p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all text-primary">
                Ver Avaliações <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mb-24 -mr-24" />
          </Link>

          {/* Cards Rápidos Inferiores */}
          <Link href="/dashboard/pdi" className="bg-surface-bento border border-border-bento-subtle p-6 rounded-3xl hover:bg-primary hover:text-white transition-all group">
            <Target className="w-6 h-6 mb-3 text-primary group-hover:text-white" />
            <h5 className="font-bold text-sm">Meu PDI</h5>
            <p className="text-[10px] opacity-60 mt-1">Plano de Carreira</p>
          </Link>

          <Link href="/dashboard/kpis" className="bg-surface-bento border border-border-bento-subtle p-6 rounded-3xl hover:bg-primary hover:text-white transition-all group">
            <TrendingUp className="w-6 h-6 mb-3 text-primary group-hover:text-white" />
            <h5 className="font-bold text-sm">Meus KPIs</h5>
            <p className="text-[10px] opacity-60 mt-1">Metas e Bônus</p>
          </Link>

          <Link href="/dashboard/funnel" className="bg-surface-bento border border-border-bento-subtle p-6 rounded-3xl hover:bg-primary hover:text-white transition-all group">
            <Activity className="w-6 h-6 mb-3 text-primary group-hover:text-white" />
            <h5 className="font-bold text-sm">Meu Funil</h5>
            <p className="text-[10px] opacity-60 mt-1">Produtividade Diária</p>
          </Link>

          <Link href="/dashboard/meu-perfil" className="bg-surface-bento border border-border-bento-subtle p-6 rounded-3xl hover:bg-primary hover:text-white transition-all group">
            <Award className="w-6 h-6 mb-3 text-primary group-hover:text-white" />
            <h5 className="font-bold text-sm">Configuração</h5>
            <p className="text-[10px] opacity-60 mt-1">Minha Conta</p>
          </Link>
        </div>

        {/* Notificações e PWA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PushNotificationManager />
          <PulseSurveyCard />
        </div>

        {/* Seção Social em Suspense */}
        <div className="pt-10 border-t border-border-bento-subtle">
          <Suspense fallback={<DashboardSkeleton />}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24">
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h4 className="text-xl font-black text-corporate-primary">Mural da Cultura</h4>
                </div>
                <SocialFeed orgId={userData.org_id} />
              </div>
              <div className="space-y-8">
                <KudosBox />
              </div>
            </div>
          </Suspense>
        </div>
      </main>
      <CultureAssistant />
    </div >
  )
}
