import { getFunnelActivities } from '@/app/actions/funnel'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { FunnelForm } from './funnel-form'
import { requirePermission } from '@/lib/supabase/auth'

export default async function FunnelPage() {
    const _auth = await requirePermission('pdi.manage') // Pelo menos employee
    const result = await getFunnelActivities({})

    const activities: { id: string, name: string }[] = result.success && result.data
        ? (result.data as { id: string, name: string }[])
        : []

    const supabase = createServerSupabaseClient()

    // Buscar os inputs do cara nos últimos 7 dias para ele ver
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const iso7Days = sevenDaysAgo.toISOString().split('T')[0]

    const { data: recentInputs } = await supabase
        .from('funnel_inputs')
        .select('*, funnel_activities(name)')
        .eq('user_id', _auth.userId)
        .gte('input_date', iso7Days)
        .order('input_date', { ascending: false })

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">Meu Forecast Diário</h1>
                <p className="text-muted-foreground">Registre rapidamente as atividades executadas hoje.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <FunnelForm
                        activities={activities}
                    />
                </div>

                <div className="bg-card rounded-lg border border-border p-6 h-fit">
                    <h2 className="text-lg font-semibold mb-4">Últimos Lançamentos</h2>

                    {(!recentInputs || recentInputs.length === 0) ? (
                        <p className="text-sm text-muted-foreground">Nenhum registro nos últimos 7 dias.</p>
                    ) : (
                        <div className="space-y-4">
                            {recentInputs.map((input: { id: string, amount: number, input_date: string, funnel_activities?: { name: string } }) => (
                                <div key={input.id} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium text-sm">{input.funnel_activities?.name}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(input.input_date).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                                        {input.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

