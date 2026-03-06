import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/supabase/auth'
import { getTrafficLight } from '@/lib/kpi-engine'
import { KpiUpdateForm } from './kpi-update-form'
import { Badge } from '@/components/ui/badge'
import { EmptyState, ErrorState } from '@/components/ui/feedback'
import { AlertCircle, CheckCircle2, Target } from 'lucide-react'

export default async function KpisPage() {
    const _auth = await requirePermission('pdi.manage')
    const supabase = createServerSupabaseClient()

    // Buscar os KPIs do cara (Targets criados pelo admin + O Definition para montar a UI)
    const { data: targets, error } = await supabase
        .from('kpi_targets')
        .select(`
      *,
      kpi_definitions ( name, data_type, is_reversed, key_slug, min_green_threshold, min_yellow_threshold, cap_percentage ),
      kpi_results ( id, actual_value, achievement_percentage, notes, updated_at )
    `)
        .eq('user_id', _auth.userId)
        .order('period_start', { ascending: false })

    // Pega apenas o ciclo atual (Simplificando: todos que o period_end for >= hoje)
    const today = new Date().toISOString().split('T')[0]
    const activeTargets = targets?.filter(t => t.period_end >= today) || []

    // Calcular Tota Ponderado do Período Ativo
    let pontuacaoTotal = 0
    let somaDosPesos = 0

    if (activeTargets.length > 0) {
        activeTargets.forEach((t) => {
            const item = t as unknown as { kpi_results: { achievement_percentage: number }[], weight: number }
            const achv = item.kpi_results?.[0]?.achievement_percentage || 0
            pontuacaoTotal += (achv * item.weight)
            somaDosPesos += item.weight
        })
    }

    const notaFinal = somaDosPesos > 0 ? (pontuacaoTotal / somaDosPesos) : 0
    const farolFinal = getTrafficLight(notaFinal)

    function TrafficBadge({ score, thresholds }: { score: number, thresholds: { green: number, yellow: number } }) {
        const cor = getTrafficLight(score, thresholds)
        if (cor === 'green') return <Badge className="bg-emerald-500 text-white">🟢 {score.toFixed(1)}%</Badge>
        if (cor === 'yellow') return <Badge className="bg-yellow-500 text-white">🟡 {score.toFixed(1)}%</Badge>
        return <Badge className="bg-destructive text-white">🔴 {score.toFixed(1)}%</Badge>
    }

    if (error) return <div className="p-8"><ErrorState title="Erro ao carregar metas" description={error.message} /></div>

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Meus Resultados</h1>
                    <p className="text-muted-foreground">Ciclo de apuração atual e acumulado.</p>
                </div>
                {activeTargets.length > 0 && (
                    <div className="bg-card/50 backdrop-blur-sm border border-border px-8 py-5 rounded-2xl shadow-lg flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
                        <div>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Atingimento Global</p>
                            <p className="text-4xl font-black tabular-nums">{notaFinal.toFixed(1)}%</p>
                        </div>
                        <TrafficBadge score={notaFinal} thresholds={{ green: 100, yellow: 80 }} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(!activeTargets || activeTargets.length === 0) ? (
                    <div className="lg:col-span-2">
                        <EmptyState
                            title="Nenhuma meta ativa"
                            description="Você ainda não possui metas atribuídas para o período atual. Fale com seu gestor para configurar seus KPIs."
                            icon={<Target className="h-10 w-10 text-muted-foreground/40" />}
                        />
                    </div>
                ) : (
                    activeTargets.map((target) => {
                        const item = target as unknown as {
                            id: string,
                            weight: number,
                            target_value: number,
                            kpi_definitions: {
                                name: string,
                                data_type: string,
                                min_green_threshold: number,
                                min_yellow_threshold: number
                            },
                            kpi_results: {
                                actual_value: number,
                                achievement_percentage: number,
                                notes: string
                            }[]
                        }
                        const def = item.kpi_definitions
                        const result = item.kpi_results?.[0]
                        const achv = result?.achievement_percentage || 0
                        const thresholds = { green: def.min_green_threshold, yellow: def.min_yellow_threshold }

                        return (
                            <div key={target.id} className="bg-card rounded-lg border border-border p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">{def.name}</h3>
                                            <p className="text-sm text-muted-foreground">Peso: {target.weight.toFixed(1)}</p>
                                        </div>
                                        <TrafficBadge score={achv} thresholds={thresholds} />
                                    </div>

                                    {/* Placeholder for error/success messages from KpiUpdateForm */}
                                    {/* These would typically be managed by state within KpiUpdateForm or a parent component */}
                                    {/* For demonstration, assuming 'error' and 'success' props might be passed down or managed here */}
                                    {/* Note: 'error' and 'success' variables are not defined in this scope, this is a placeholder */}
                                    {/* {error && (
                                        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl mb-6 font-medium border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                                            <AlertCircle className="h-5 w-5 shrink-0" />
                                            {error}
                                        </div>
                                    )}
                                    {success && (
                                        <div className="bg-emerald-500/10 text-emerald-500 text-sm p-4 rounded-xl mb-6 font-medium border border-emerald-500/20 flex items-center gap-3 animate-in zoom-in duration-300">
                                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                                            Apontamento salvo com sucesso!
                                        </div>
                                    )} */}

                                    <div className="grid grid-cols-2 gap-4 my-6 p-4 rounded-md bg-muted/30">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Meta</p>
                                            <p className="text-xl font-semibold">
                                                {def.data_type === 'currency' ? 'R$ ' : ''}
                                                {target.target_value}
                                                {def.data_type === 'percentage' ? '%' : ''}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Realizado</p>
                                            <p className="text-xl font-semibold text-primary">
                                                {def.data_type === 'currency' ? 'R$ ' : ''}
                                                {result?.actual_value || '0'}
                                                {def.data_type === 'percentage' ? '%' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border">
                                    <KpiUpdateForm
                                        targetId={target.id}
                                        currentActual={result?.actual_value || 0}
                                        notes={result?.notes || ''}
                                    />
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

