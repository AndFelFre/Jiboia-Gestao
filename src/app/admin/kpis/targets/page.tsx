import { getKpiDefinitions } from '@/app/actions/kpis'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/supabase/auth'
import { TargetAssignmentForm } from './TargetAssignmentForm'
import Link from 'next/link'
import type { KpiDefinition, KpiTarget } from '@/types'

export default async function KpiTargetsPage() {
    await requirePermission('org.manage')
    const supabase = createServerSupabaseClient()

    // Buscar definições de KPIs
    const kpiResult = await getKpiDefinitions({})
    const kpis = kpiResult.success && kpiResult.data ? (kpiResult.data as KpiDefinition[]) : []

    // Buscar todos os usuários da org
    const { data: users } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('status', 'active')
        .order('full_name')

    // Buscar metas atuais para exibir na tabela
    const { data: currentTargets } = await supabase
        .from('kpi_targets')
        .select('*, kpi_definitions(name), users(full_name)')
        .order('period_start', { ascending: false })

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Link href="/admin/kpis" className="text-primary hover:underline text-sm mb-2 block">← Voltar para KPIs</Link>
                    <h1 className="text-2xl font-bold text-foreground">Atribuição de Metas Individual</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <TargetAssignmentForm users={users || []} kpis={kpis} />
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-muted/30">
                            <h2 className="font-semibold">Histórico de Metas Atribuídas</h2>
                        </div>

                        {!currentTargets || currentTargets.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">Nenhuma meta atribuída ainda.</div>
                        ) : (
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Colaborador</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">KPI</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Período</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Meta</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {(currentTargets as unknown as KpiTarget[]).map((target) => (
                                        <tr key={target.id} className="hover:bg-muted/30">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                                {target.users?.full_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {target.kpi_definitions?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                                                {new Date(target.period_start).toLocaleDateString('pt-BR')} - {new Date(target.period_end).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-primary">
                                                {target.target_value}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

