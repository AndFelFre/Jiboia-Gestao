import { createServerSupabaseClientReadOnly } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Target,
  Zap,
  Settings,
  LogOut,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Activity
} from 'lucide-react'
import { CultureAssistant } from '@/components/ai/CultureAssistant'
import { PushNotificationManager } from '@/components/mobile/PushNotificationManager'
import { KudosBox } from '@/components/social/KudosBox'
import { SocialFeed } from '@/components/social/SocialFeed'
import { PulseSurveyCard } from '@/components/social/PulseSurveyCard'
import { seedDefaultPulseSurvey } from '@/app/actions/pulse'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  await seedDefaultPulseSurvey() // Garante uma pesquisa padrão para demo
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
      {/* Sidebar Simulado / Header */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b z-50 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">RG Digital</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/meu-perfil" className="hidden md:flex flex-col items-end mr-2 group">
            <span className="text-sm font-semibold group-hover:text-primary transition-colors">{userData.full_name}</span>
            <span className="text-[10px] uppercase font-bold text-primary tracking-widest">{roleName}</span>
          </Link>
          <form action="/api/auth/signout" method="post">
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {/* Boas vindas */}
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-foreground">Dashboard Principal</h2>
          <p className="text-muted-foreground mt-1">Bem-vindo de volta! Aqui está um resumo do seu sistema.</p>
        </header>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-16 h-16 text-primary" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Status do Perfil</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="text-xl font-bold capitalize">{userData.status}</h3>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <MapPin className="w-16 h-16 text-primary" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Unidade</p>
            <h3 className="text-xl font-bold truncate">{userData.unit_id?.slice(0, 13) || 'Sede Principal'}...</h3>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <Activity className="w-16 h-16 text-primary" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Acesso</p>
            <h3 className="text-xl font-bold">{userData.org_id ? 'Corporativo' : 'Individual'}</h3>
          </div>
        </div>

        {/* Notificações PWA Support */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <PushNotificationManager />
          <PulseSurveyCard />
        </div>

        {/* Acesso Rápido aos Módulos */}
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Acesso Rápido</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Link href="/admin/recruitment" className="group bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-bold">Recrutamento</h4>
              <p className="text-white/70 mt-2 max-w-[280px]">Gerencie vagas, pipeline de candidatos e o processo de seleção STAR.</p>
              <div className="mt-8 flex items-center gap-2 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                Abrir Módulo <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          </Link>

          <Link href="/admin/performance/evaluations" className="group bg-gradient-to-br from-orange-500 to-rose-600 p-8 rounded-3xl text-white relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-bold">Performance</h4>
              <p className="text-white/70 mt-2 max-w-[280px]">Ciclos de avaliação de desempenho, PDI e mapa de competências.</p>
              <div className="mt-8 flex items-center gap-2 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                Abrir Módulo <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          </Link>

          <Link href="/dashboard/pdi" className="group bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl text-white relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-bold">Meu PDI</h4>
              <p className="text-white/70 mt-2 max-w-[280px]">Visualize seus gaps de competência e seu plano de carreira.</p>
              <div className="mt-8 flex items-center gap-2 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                Ver Meu Plano <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          </Link>

          <Link href="/dashboard/kpis" className="group bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-3xl text-white relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-bold">Meus KPIs</h4>
              <p className="text-white/70 mt-2 max-w-[280px]">Acompanhe suas metas, realizado e % de bônus variável.</p>
              <div className="mt-8 flex items-center gap-2 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                Ver Meus Resultados <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          </Link>

          <Link href="/dashboard/funnel" className="group bg-gradient-to-br from-orange-400 to-amber-600 p-8 rounded-3xl text-white relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-bold">Meu Funil</h4>
              <p className="text-white/70 mt-2 max-w-[280px]">Faça o forecast diário de atividades e vendas executadas.</p>
              <div className="mt-8 flex items-center gap-2 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                Lançar Atividades <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          </Link>

          {roleName === 'admin' && (
            <Link href="/admin" className="lg:col-span-2 group border-2 border-dashed border-border p-6 rounded-3xl flex items-center justify-between hover:border-primary/50 transition-all hover:bg-card">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold">Configurações do Sistema</h4>
                  <p className="text-sm text-muted-foreground">Unidades, cargos, níveis e auditoria de sistema.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-all" />
            </Link>
          )}

        </div>

        {/* Seção Social & Comunidade */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 pb-24">
          <div className="lg:col-span-2 space-y-8">
            <SocialFeed />
          </div>
          <div className="space-y-8">
            <KudosBox />
          </div>
        </div>
      </main>
      <CultureAssistant />
    </div >
  )
}
