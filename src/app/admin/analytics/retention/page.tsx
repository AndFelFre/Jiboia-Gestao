import { getRetentionRiskData } from '@/app/admin/actions/analytics'
import { RetentionRiskMatrix } from '@/components/admin/analytics/RetentionRiskMatrix'
import { ShieldAlert, ArrowLeft, Download, Info } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function RetentionRiskPage() {
    const res = await getRetentionRiskData({})

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
                            <div className="w-14 h-14 bg-rose-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-rose-200">
                                <ShieldAlert className="text-white w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Risco de Retenção</h1>
                                <p className="text-slate-500 font-medium italic">Análise de Estabilidade e Saúde do Capital Humano</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-2xl border-slate-200 h-11 px-6 font-bold text-xs flex items-center gap-2 hover:bg-slate-50">
                            <Download className="w-3.5 h-3.5" />
                            Exportar Relatório [PDF]
                        </Button>
                    </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                {/* Dashboard principal */}
                {!res.success || !res.data ? (
                    <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 font-bold">
                        Erro ao carregar dados de risco: {res.error || 'Dados indisponíveis'}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Nota de Metodologia */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] -mt-20 -mr-20" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black italic flex items-center gap-2">
                                        <Info className="w-5 h-5 text-rose-400" />
                                        Metodologia Determinística (Sem IA)
                                    </h4>
                                    <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                                        O risco é calculado exclusivamente através de fatos observáveis: atrasos em ritos de liderança, onboarding estagnado e lacunas de ciclos avaliativos.
                                        **Não realizamos predições subjetivas.** O anonimato é garantido em grupos com menos de 3 colaboradores.
                                    </p>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Status de Compliance</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-xs font-bold font-mono">PRIVACY_BY_DESIGN_ACTIVE</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Matriz de Risco por Unidade */}
                        <RetentionRiskMatrix data={res.data} />
                    </div>
                )}
            </div>
        </div>
    )
}
