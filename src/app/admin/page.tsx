import Link from 'next/link'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'
import {
  Building2,
  MapPin,
  Briefcase,
  Layers,
  GitBranch,
  Users,
  ClipboardCheck,
  ChevronRight,
  Rocket,
  ArrowRight,
  Target,
  BarChart3,
  TrendingDown,
  BrainCircuit,
  ShieldCheck,
  Zap,
  LayoutGrid,
  History,
  Trophy,
  Activity,
  BarChart,
  PieChart,
  Settings2,
  Lock,
  Flag,
  CalendarDays,
  TrendingUp,
  ListTodo,
} from 'lucide-react'
import { ADMIN_MODULES, navCategories } from '@/config/navigation'
import { AdminQuickActions } from '@/components/admin/AdminQuickActions'
import { getLeadershipAlerts } from '@/app/admin/actions/dho-alerts'
import { DHOAlertsBanner } from '@/components/dho/DHOAlertsBanner'

const colorStyles = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/50 hover:bg-blue-600 hover:text-white',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50 hover:bg-emerald-600 hover:text-white',
  orange: 'bg-orange-50 text-orange-600 border-orange-100 shadow-orange-100/50 hover:bg-orange-600 hover:text-white',
  purple: 'bg-purple-50 text-purple-600 border-purple-100 shadow-purple-100/50 hover:bg-purple-600 hover:text-white',
  pink: 'bg-pink-50 text-pink-600 border-pink-100 shadow-pink-100/50 hover:bg-pink-600 hover:text-white',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50 hover:bg-indigo-600 hover:text-white',
  slate: 'bg-slate-50 text-slate-600 border-slate-100 shadow-slate-100/50 hover:bg-slate-600 hover:text-white',
  rose: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/50 hover:bg-rose-600 hover:text-white',
  amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50 hover:bg-amber-600 hover:text-white',
  red: 'bg-red-50 text-red-600 border-red-100 shadow-red-100/50 hover:bg-red-600 hover:text-white',
  violet: 'bg-violet-50 text-violet-600 border-violet-100 shadow-violet-100/50 hover:bg-violet-600 hover:text-white',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100 shadow-yellow-100/50 hover:bg-yellow-600 hover:text-white',
}

const variantStyles = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  gray: 'bg-muted text-muted-foreground',
  yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}

export default async function AdminPage() {
  const alertsRes = await getLeadershipAlerts()
  const alerts = alertsRes.success ? (alertsRes.data || []) : []

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <header className="bg-white border-b border-slate-100 flex items-center justify-center sticky top-0 z-50">
        <div className="max-w-7xl w-full px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-primary/20">
              <LayoutGrid className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">RG Digital <span className="text-primary">Admin</span></h1>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Sistema de Gestão Estratégica</p>
            </div>
          </div>
          <Link href="/dashboard" className="group flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all duration-300">
            Dashboard Geral
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-2">Painel de Controle</h2>
          <div className="h-1.5 w-20 bg-primary rounded-full mb-4"></div>
          <p className="text-slate-500 font-medium max-w-2xl">
            Configure a estrutura organizacional, gerencie talentos e analise indicadores estratégicos em tempo real.
          </p>
        </div>

        {/* Quick Actions - Atalhos de alta frequência */}
        <AdminQuickActions />

        {/* DHO Risk Alerts */}
        <DHOAlertsBanner alerts={alerts} />

        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {navCategories.map((category) => {
            const CatIcon = category.icon;
            const modules = ADMIN_MODULES.filter(m => m.category === category.id);

            if (modules.length === 0) return null;

            return (
              <section key={category.id} className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <CatIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                    {category.label}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {modules.map((module) => {
                    const Icon = module.icon
                    return (
                      <Link
                        key={module.href}
                        href={module.href}
                        className="group relative flex flex-col p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1 border-b-4 hover:border-b-primary overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-all duration-500 shadow-sm",
                          colorStyles[module.color as keyof typeof colorStyles]
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-base font-black text-slate-900 group-hover:text-primary transition-colors mb-1">{module.title}</h3>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">{module.description}</p>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">Acessar</span>
                          <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary transition-colors">
                            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="relative p-10 bg-slate-900 rounded-[3rem] text-white overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mt-24 -mr-24 animate-pulse"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <ShieldCheck className="text-primary w-8 h-8" />
                Segurança & Rastreabilidade
              </h2>
              <ul className="space-y-4">
                {[
                  'Logs de auditoria em tempo real para cada alteração',
                  'Isolamento rigoroso de dados por Organização (RLS)',
                  'Controle granular de permissões (ADMIN, MANAGER, USER)',
                  'Monitoramento e revogação de sessões ativas'
                ].map((text, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-300 font-medium">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]"></div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 hover:border-primary/50 transition-colors">
                <div className="text-3xl font-black mb-1">{ADMIN_MODULES.length}</div>
                <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Módulos Ativos</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 hover:border-primary/50 transition-colors">
                <div className="text-3xl font-black mb-1">24/7</div>
                <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Sincronização</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
