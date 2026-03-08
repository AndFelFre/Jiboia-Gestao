import { getFunnelActivities } from '@/app/actions/funnel'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { FunnelForm } from './funnel-form'
import { requirePermission } from '@/lib/supabase/auth'
import { Calendar, BarChart2, ListTodo, TrendingUp } from 'lucide-react'

export default async function FunnelPage() {
    const _auth = await requirePermission('pdi.manage')
    const result = await getFunnelActivities({})

    const activities: { id: string, name: string }[] = result.success && result.data
        ? (result.data as { id: string, name: string }[])
        : []

    const supabase = createServerSupabaseClient()

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
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-corporate-primary">Meu Funil</h1>
                    <p className="text-muted-foreground font-medium mt-1">Forecast diário e rastro de produtividade.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-bento border border-border-bento-subtle rounded-2xl shadow-sm text-xs font-bold text-corporate-primary">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    Últimos 7 dias
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <FunnelForm
                        activities={activities}
                    />
                </div>

                <div className="lg:col-span-2 bg-surface-bento border border-border-bento-subtle p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <ListTodo className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-black text-corporate-primary">Histórico Recente</h2>
                    </div>

                    {(!recentInputs || recentInputs.length === 0) ? (
                        <div className="py-12 text-center bg-muted/20 rounded-3xl border border-dashed border-border-bento-subtle">
                            <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground font-medium">Nenhum registro nos últimos 7 dias.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentInputs.map((input: { id: string, amount: number, input_date: string, funnel_activities?: { name: string } }) => (
                                <div key={input.id} className="flex justify-between items-center p-4 rounded-2xl border border-transparent hover:border-border-bento-subtle hover:bg-muted/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                        <div>
                                            <p className="font-black text-sm text-corporate-primary">{input.funnel_activities?.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{new Date(input.input_date).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                    <div className="bg-primary/5 text-primary font-black px-4 py-1.5 rounded-xl border border-primary/10 text-sm min-w-[3rem] text-center">
                                        {input.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <BarChart2 className="absolute -bottom-10 -right-10 w-48 h-48 text-primary/5 -rotate-12" />
                </div>
            </div>
        </div>
    )
}
