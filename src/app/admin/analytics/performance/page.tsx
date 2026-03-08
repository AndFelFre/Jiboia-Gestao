import { getPerformanceOrganizationAnalytics } from '@/app/admin/actions/dho-performance-analytics'
import { PerformanceHeatmap } from '@/components/dho/analytics/PerformanceHeatmap'
import { SMARTConversionFunnel } from '@/components/dho/analytics/SMARTConversionFunnel'
import { PerformanceTrendChart } from '@/components/dho/analytics/PerformanceTrendChart'
import { SMARTRankingTable } from '@/components/dho/analytics/SMARTRankingTable'
import { RampupPerformanceCorrelation } from '@/components/dho/analytics/RampupPerformanceCorrelation'
import { TrendingUp, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function PerformanceAnalyticsPage() {
    const analyticsRes = await getPerformanceOrganizationAnalytics()

    if (!analyticsRes.success || !analyticsRes.data) {
        return (
            <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 font-bold">
                Erro ao carregar analytics: {analyticsRes.error || 'Dados indisponíveis'}
            </div>
        )
    }

    const data = analyticsRes.data
    const totalSamples = data.reduce((acc, curr) => acc + curr.sample_size, 0)

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
                            <div className="w-14 h-14 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-200">
                                <TrendingUp className="text-white w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Performance Organizacional</h1>
                                <p className="text-slate-500 font-medium">Análise agregada de RUA (Comportamental) e SMART (Tático)</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Botão de Refresh (Simulado - o real exigiria Client Component para o feedback de loading) */}
                        <Button variant="outline" className="rounded-2xl border-slate-200 h-11 px-6 font-bold text-xs flex items-center gap-2 hover:bg-slate-50">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Atualizar Agregados
                        </Button>
                    </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                {/* Resumo Rápido */}
                {totalSamples === 0 ? (
                    <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] flex flex-col items-center text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-amber-500" />
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-amber-900">Ainda não há dados agregados</h3>
                            <p className="text-amber-700 text-sm max-w-md">
                                Os dashboards analíticos dependem de ciclos de avaliação com status "Concluído" (Closed).
                                No momento, não identificamos avaliações finalizadas na sua organização.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Heatmap Corporativo */}
                            <div className="lg:col-span-1">
                                <PerformanceHeatmap data={data} />
                            </div>

                            {/* Ranking SMART */}
                            <div className="lg:col-span-1">
                                <SMARTRankingTable data={data} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Funil de Conversão SMART */}
                            <div className="lg:col-span-1">
                                <SMARTConversionFunnel data={data} />
                            </div>

                            {/* Correlação Rampagem vs Performance */}
                            <div className="lg:col-span-1">
                                <RampupPerformanceCorrelation data={data} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {/* Tendência Histórica */}
                            <PerformanceTrendChart data={data} />
                        </div>

                        {/* Footer / Nota de Segurança */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mt-20 -mr-20" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black italic">Dashboards Estratégicos (Fase 9)</h4>
                                    <p className="text-slate-400 text-sm max-w-2xl">
                                        Os dados exibidos são pré-calculados via **Materialized Views** para garantir performance instantânea.
                                        A privacidade individual é garantida pelo threshold de anonimização (mínimo de 3 avaliações por grupo).
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Motor de Cálculo</div>
                                    <div className="flex items-center gap-2 justify-end">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-bold font-mono">BATCH_PROC_STATUS_OK</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
