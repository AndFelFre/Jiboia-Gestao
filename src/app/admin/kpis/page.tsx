import { getKpiDefinitions } from '@/app/actions/kpis'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/supabase/auth'
import { KpiDefinitionForm } from './KpiDefinitionForm'

export default async function AdminKpisPage() {
    await requirePermission('org.manage') // Proteção Admin
    const result = await getKpiDefinitions({})
    const kpis = result.success && result.data ? result.data as any[] : [] // fallback any temporário para evitar quebra mas melhorado

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Gestão de Indicadores Globais (KPIs)</h1>
                <p className="text-muted-foreground mt-1">
                    Crie e gerencie os KPIs que serão distribuídos em forma de Meta (Targets) para os colaboradores da operação.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulário Fixo na Lateral */}
                <div className="lg:col-span-1">
                    <KpiDefinitionForm />
                </div>

                {/* Listagem de KPIs Ativos */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold mb-4 text-foreground">Indicadores Cadastrados</h2>

                    {kpis.length === 0 ? (
                        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
                            Nenhum KPI cadastrado. Crie o seu primeiro indicador.
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nome do KPI</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tipo Base</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Teto (Cap)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Invertido?</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {kpis.map((kpi) => (
                                        <tr key={kpi.id} className="hover:bg-muted/30">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-foreground">{kpi.name}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Slug: {kpi.key_slug}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                    {kpi.data_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {kpi.cap_percentage}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                {kpi.is_reversed ? (
                                                    <span className="text-yellow-500 font-semibold text-xs">Sim (Ex: Churn)</span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">Não</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

