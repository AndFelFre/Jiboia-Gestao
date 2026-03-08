import { getKpiDefinitions } from '@/app/actions/kpis'
import { getOrganizations } from '../actions/organizations'
import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { KpiDefinitionForm } from './KpiDefinitionForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminKpisPage() {
    const auth = await requirePermission('org.manage')

    // Buscar organizações para o seletor de contexto
    const orgsResult = await getOrganizations()
    const organizations = orgsResult.success ? (orgsResult.data as any[]) : []

    // Determinar org_id: user normal → sua org, admin → primeira org disponível
    const contextOrgId = auth.role !== 'admin' ? auth.orgId : organizations[0]?.id

    // Buscar KPIs da org selecionada
    const result = await getKpiDefinitions({ org_id: contextOrgId })
    const kpis = result.success && result.data ? result.data as any[] : []

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <Link href="/admin" className="text-primary hover:text-primary/80 text-sm">
                    ← Admin
                </Link>
                <h1 className="text-2xl font-bold text-foreground mt-1">Gestão de Indicadores Globais (KPIs)</h1>
                <p className="text-muted-foreground mt-1">
                    Crie e gerencie os KPIs que serão distribuídos em forma de Meta (Targets) para os colaboradores da operação.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulário Fixo na Lateral */}
                <div className="lg:col-span-1">
                    <KpiDefinitionForm
                        organizations={organizations}
                        selectedOrgId={contextOrgId}
                    />

                    <div className="mt-4">
                        <Link
                            href="/admin/kpis/targets"
                            className="block w-full text-center px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 font-medium text-sm border border-border"
                        >
                            Atribuir Metas →
                        </Link>
                    </div>
                </div>

                {/* Listagem de KPIs Ativos */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold mb-4 text-foreground">Indicadores Cadastrados</h2>

                    {kpis.length === 0 ? (
                        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
                            Nenhum KPI cadastrado{contextOrgId ? ' nesta organização' : ''}. Crie o seu primeiro indicador.
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
