'use server'
export const dynamic = 'force-dynamic'

import { getSkillHeatmap } from '@/app/admin/actions/analytics'
import { SkillHeatmap } from '@/components/analytics/SkillHeatmap'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
    LayoutGrid,
    Info,
    AlertCircle,
    Building,
    Filter
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { HeatmapActions } from '@/components/analytics/HeatmapActions'

export default async function SkillsHeatmapPage() {
    const res = await getSkillHeatmap()

    if (!res.success || !res.data) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-900">Erro ao carregar Heatmap</h2>
                <p className="text-slate-500 max-w-xs">{res.error || 'Ocorreu um problema ao processar os dados de competências.'}</p>
            </div>
        )
    }

    const { skills, users, matrix } = res.data

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-primary" />
                        Heatmap de Competências
                    </h1>
                    <p className="text-slate-500 mt-1 uppercase text-xs font-bold tracking-widest">Inteligência Tática e Gaps de Talentos</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 border-none flex items-center gap-2 h-10">
                        <Building className="w-4 h-4" />
                        Toda a Organização
                    </Badge>
                    <div className="h-8 w-px bg-slate-100 hidden md:block" />
                    <HeatmapActions data={res.data} />
                </div>
            </header>

            {/* Legend / Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-200" />
                    <span className="text-xs font-bold text-slate-600">Gap Crítico</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-200" />
                    <span className="text-xs font-bold text-slate-600">Excelência (4+)</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-200" />
                    <span className="text-xs font-bold text-slate-600">Esperado (3)</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-amber-500/10 border border-amber-200" />
                    <span className="text-xs font-bold text-slate-600">Desenvolvimento (1-2)</span>
                </div>
            </div>

            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">Matriz de Habilidades</CardTitle>
                            <CardDescription>Comparação entre scores atuais e requisitos de cargo.</CardDescription>
                        </div>
                        <Info className="w-5 h-5 text-slate-300" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {users.length > 0 ? (
                        <SkillHeatmap data={res.data} />
                    ) : (
                        <div className="p-20 text-center text-slate-400 italic">
                            Nenhum dado de avaliação concluído encontrado para gerar o heatmap.
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Info className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                    <h4 className="font-bold text-lg">Como ler o Heatmap?</h4>
                    <p className="text-slate-400 text-sm mt-1">
                        As células com fundo vermelho indicam que o colaborador está abaixo do nível exigido para o seu cargo atual.
                        As bolinhas vermelhas indicam o tamanho do gap. Use esta visão para priorizar treinamentos e PDIs.
                    </p>
                </div>
            </div>
        </div>
    )
}
