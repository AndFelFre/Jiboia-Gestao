import { getNineBoxMatrixData } from '@/app/admin/actions/dho-performance'
import { NineBoxMatrixGrid } from '@/components/dho/NineBoxMatrixGrid'
// ... (existing imports)

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrendingUp, Users, Info, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function CalibrationDashboardPage() {
    const result = await getNineBoxMatrixData()
    const evaluations = result.success ? (result.data || []) : []

    // Estatísticas Rápidas
    const totalCalibrated = evaluations.length
    const stars = evaluations.filter(e => e.nine_box_quadrant === 'star').length
    const risks = evaluations.filter(e => e.nine_box_quadrant === 'risk').length

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Calibração de Talentos</h1>
                                <p className="text-sm font-medium text-slate-500">Matriz 9-Box Organizacional</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* KPI Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-indigo-600">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Calibrado</p>
                                    <p className="text-2xl font-black text-slate-900 mt-1">{totalCalibrated}</p>
                                </div>
                                <Users className="w-8 h-8 text-slate-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Top Talents (Stars)</p>
                                    <p className="text-2xl font-black text-slate-900 mt-1">{stars}</p>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700 border-none">Destaque</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-red-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Risco de Retenção/Perf</p>
                                    <p className="text-2xl font-black text-slate-900 mt-1">{risks}</p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-red-100" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Matriz 9-Box */}
                    <Card className="lg:col-span-2 rounded-3xl border-slate-200 shadow-sm p-8 bg-white overflow-hidden relative">
                        <CardHeader className="p-0 mb-8">
                            <CardTitle className="text-xl font-black text-slate-900">Snapshot Estratégico</CardTitle>
                            <CardDescription>Distribuição baseada no último ciclo de avaliação fechado.</CardDescription>
                        </CardHeader>
                        <NineBoxMatrixGrid data={evaluations as any} />
                    </Card>

                    {/* Legenda e Insights */}
                    <div className="space-y-6">
                        <Card className="rounded-2xl border-slate-200 shadow-sm bg-slate-900 text-white overflow-hidden">
                            <CardHeader className="p-6 pb-0">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Info className="w-4 h-4 text-indigo-400" />
                                    Critério de Calibração
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Eixo X: Desempenho</p>
                                    <ul className="text-xs space-y-1.5 text-slate-400">
                                        <li className="flex gap-2"><span>1.</span> Abaixo do Esperado (RUA &lt; 3.0 ou SMART &lt; 50%)</li>
                                        <li className="flex gap-2"><span>2.</span> Atende o Esperado (Equilíbrio entre RUA e SMART)</li>
                                        <li className="flex gap-2"><span>3.</span> Supera o Esperado (RUA &gt; 4.5 e SMART &gt; 90%)</li>
                                    </ul>
                                </div>
                                <div className="space-y-2 pt-4 border-t border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Eixo Y: Potencial</p>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Atribuído manualmente pelo líder durante o ciclo, avaliando prontidão para novos níveis e agilidade de aprendizado.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-amber-900">Atenção ao Snapshot</p>
                                <p className="text-[11px] text-amber-700 leading-relaxed mt-1">
                                    Somente colaboradores com ciclos de avaliação **concluídos** e calibrados são exibidos nesta matriz.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
