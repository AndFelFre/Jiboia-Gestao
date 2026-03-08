import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/supabase/auth'
import { getTrafficLight, calculateWeightedAverage, WeightedKpiInput } from '@/lib/kpi-engine'
import { KpiUpdateForm } from './kpi-update-form'
import { Badge } from '@/components/ui/badge'
import { EmptyState, ErrorState } from '@/components/ui/feedback'
import { AlertCircle, CheckCircle2, Target, AlertTriangle, Info } from 'lucide-react'

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

    // Preparar inputs para o Engine de Média Ponderada
    const kpiInputs: WeightedKpiInput[] = activeTargets.map(t => ({
        id: t.id,
        weight: t.weight,
        achievement: (t.kpi_results?.[0] as any)?.achievement_percentage || 0
    }))

    const notaFinal = calculateWeightedAverage(kpiInputs)
    const farolFinal = getTrafficLight(notaFinal)

    function TrafficBadge({ score, thresholds }: { score: number, thresholds: { green: number, yellow: number } }) {
        const cor = getTrafficLight(score, thresholds)
        const commonClasses = "flex items-center gap-1.5 px-3 py-1 font-bold shadow-sm"

        if (cor === 'green') return (
            <Badge className={`${commonClasses} bg-emerald-500/10 text-emerald-600 border border-emerald-500/20`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> {score.toFixed(1)}%
            </Badge>
        )
        if (cor === 'yellow') return (
            <Badge className={`${commonClasses} bg-amber-500/10 text-amber-600 border border-amber-500/20`}>
                <AlertTriangle className="w-3.5 h-3.5" /> {score.toFixed(1)}%
            </Badge>
        )
        return (
            <Badge className={`${commonClasses} bg-rose-500/10 text-rose-600 border border-rose-500/20`}>
                <AlertCircle className="w-3.5 h-3.5" /> {score.toFixed(1)}%
            </Badge>
        )
    }

    if (error) return <div className="p-8"><ErrorState title="Erro ao carregar metas" description={error.message} /></div>

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-corporate-primary">Meus Resultados</h1>
                    <p className="text-muted-foreground font-medium">Ciclo de apuração atual e desempenho consolidado.</p>
                </div>
                {activeTargets.length > 0 && (
                    <div className="bg-surface-bento border border-border-bento-subtle px-10 py-6 rounded-[2.5rem] shadow-sm flex items-center gap-8 animate-in fade-in slide-in-from-right-4 duration-700">
                        <div>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1">Atingimento Global</p>
                            <p className="text-5xl font-black tabular-nums text-corporate-primary">{notaFinal.toFixed(1)}%</p>
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
                        const item = target as any
                        const def = item.kpi_definitions
                        const result = item.kpi_results?.[0]
                        const achv = result?.achievement_percentage || 0
                        const thresholds = { green: def.min_green_threshold, yellow: def.min_yellow_threshold }

                        return (
                            <div key={target.id} className="bg-surface-bento rounded-[2.5rem] border border-border-bento-subtle p-8 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:border-primary/20 transition-all duration-500">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-black text-corporate-primary mb-1">{def.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="bg-muted/50 text-muted-foreground text-[10px] font-bold px-2 py-0 border-none">
                                                    PESO: {target.weight.toFixed(1)}
                                                </Badge>
                                                {def.is_reversed && (
                                                    <Badge className="bg-blue-500/10 text-blue-600 text-[10px] font-bold border-none">INVERTIDO</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <TrafficBadge score={achv} thresholds={thresholds} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 my-8 p-6 rounded-3xl bg-muted/20 border border-border-bento-subtle/50">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground mb-1 font-black uppercase tracking-widest">Meta</p>
                                            <p className="text-2xl font-black text-corporate-primary">
                                                {def.data_type === 'currency' ? 'R$ ' : ''}
                                                {target.target_value.toLocaleString('pt-BR')}
                                                {def.data_type === 'percentage' ? '%' : ''}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground mb-1 font-black uppercase tracking-widest">Realizado</p>
                                            <p className="text-2xl font-black text-primary">
                                                {def.data_type === 'currency' ? 'R$ ' : ''}
                                                {(result?.actual_value || 0).toLocaleString('pt-BR')}
                                                {def.data_type === 'percentage' ? '%' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-6 border-t border-border-bento-subtle/50">
                                    <div className="flex items-center gap-2 mb-4 text-xs font-medium text-muted-foreground pl-1">
                                        <Info className="w-3.5 h-3.5 text-primary" />
                                        <span>Atualize seus resultados para recalcular o atingimento global.</span>
                                    </div>
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

