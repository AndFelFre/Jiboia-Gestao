import { getOnboardingOrganizationAnalytics } from '@/app/admin/actions/dho-onboarding'
import { OnboardingSummaryKPIs } from '@/components/dho/analytics/OnboardingSummaryKPIs'
import { OnboardingFunnel } from '@/components/dho/analytics/OnboardingFunnel'
import { OnboardingStatusTable } from '@/components/dho/analytics/OnboardingStatusTable'
import { Rocket, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OnboardingAnalyticsPage() {
    const analyticsRes = await getOnboardingOrganizationAnalytics()

    if (!analyticsRes.success || !analyticsRes.data) {
        return (
            <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 font-bold">
                Erro ao carregar analytics: {analyticsRes.error || 'Dados indisponíveis'}
            </div>
        )
    }

    const { summary, funnel, users } = analyticsRes.data

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors mb-2"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Voltar ao Admin
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-indigo-200">
                                <Rocket className="text-white w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics de Rampagem</h1>
                                <p className="text-slate-500 font-medium">Métricas de maturidade e onboarding organizacional (D0-D120)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                {/* KPIs */}
                <OnboardingSummaryKPIs
                    total={summary.totalEmployees}
                    onTrack={summary.onTrackEmployees}
                    lagging={summary.laggingEmployees}
                    avgProgress={summary.avgProgress}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Funnel - Esquerda */}
                    <div className="lg:col-span-1">
                        <OnboardingFunnel funnel={funnel} />
                    </div>

                    {/* Table - Direita */}
                    <div className="lg:col-span-2">
                        <OnboardingStatusTable users={users} />
                    </div>
                </div>

                {/* Footer / Nota Técnica */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mt-20 -mr-20" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h4 className="text-lg font-black italic">Régua de Maturidade V1</h4>
                            <p className="text-slate-400 text-sm max-w-xl">
                                O status é calculado de forma linear ao longo de 90 dias, com uma margem de tolerância de 10%.
                                Colaboradores com progresso abaixo dessa régua são sinalizados como <span className="text-rose-400 font-bold">Lagging</span> para intervenção imediata da liderança.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Status do Motor</div>
                            <div className="flex items-center gap-2 justify-end">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold font-mono">CALC_DERIVED_OK</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
