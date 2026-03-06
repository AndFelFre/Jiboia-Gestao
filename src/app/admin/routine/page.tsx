import { createServerSupabaseClientReadOnly } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Target, Activity } from 'lucide-react'
import { CreateRoutineDefinitionForm } from '@/components/routine/CreateRoutineDefinitionForm'

export const dynamic = 'force-dynamic'

export default async function AdminRoutinePage() {
    const supabase = createServerSupabaseClientReadOnly()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('id, org_id, roles(name)')
        .eq('id', user.id)
        .single()

    const roleData = userData?.roles as any
    const roleName = Array.isArray(roleData) ? roleData[0]?.name : roleData?.name

    if (roleName !== 'admin' && roleName !== 'leader') {
        redirect('/dashboard?error=access_denied')
    }

    // Busca metas
    const { data: definitions } = await supabase
        .from('routine_definitions')
        .select('*')
        .eq('org_id', userData?.org_id)
        .order('created_at', { ascending: false })

    // Busca preenchimentos de hoje da Org inteira
    const today = new Date().toISOString().split('T')[0]
    const { data: todayInputs } = await supabase
        .from('routine_inputs')
        .select('achieved_value, notes, users(full_name), routine_definitions(title, target_value)')
        .eq('org_id', userData?.org_id)
        .eq('input_date', today)

    return (
        <div className="min-h-screen bg-background p-6 lg:p-10">
            <header className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 text-primary flex items-center justify-center rounded-xl">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-foreground">Cockpit Gerencial (Rotina)</h2>
                        <p className="text-muted-foreground mt-1">
                            Ajuste as Barras Mínimas e veja a tração do time hoje.
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Criar/Listar Metas */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-foreground mb-4">Nova Meta de Engajamento</h3>
                        <CreateRoutineDefinitionForm />
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-foreground mb-4">Metas Ativas</h3>
                        {(!definitions || definitions.length === 0) ? (
                            <p className="text-sm text-muted-foreground">Nenhuma métrica criada ainda.</p>
                        ) : (
                            <div className="space-y-4">
                                {definitions.map(def => (
                                    <div key={def.id} className="p-3 border border-border rounded-lg bg-muted/30">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-sm">{def.title}</h4>
                                            <span className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-sm">
                                                {def.frequency}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Alvo: {def.target_value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Relatórios de Hoje */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-foreground mb-6">Realizado vs Meta (HOJE)</h3>

                        {(!todayInputs || todayInputs.length === 0) ? (
                            <div className="text-center p-12 text-muted-foreground border border-dashed border-border rounded-xl">
                                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Nenhum colaborador preencheu o Cockpit hoje ainda.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                                            <th className="pb-3 px-2">Colaborador</th>
                                            <th className="pb-3 px-2">Métrica</th>
                                            <th className="pb-3 px-2 text-right">Atingimento</th>
                                            <th className="pb-3 px-2 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-border/50">
                                        {todayInputs.map((input: any, idx) => {
                                            const achieved = Number(input.achieved_value)
                                            const target = Number(input.routine_definitions.target_value)
                                            const isGreen = achieved >= target

                                            return (
                                                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                                    <td className="py-3 px-2 font-medium">{input.users.full_name}</td>
                                                    <td className="py-3 px-2 text-muted-foreground">{input.routine_definitions.title}</td>
                                                    <td className="py-3 px-2 text-right">
                                                        <span className="font-bold">{achieved}</span>
                                                        <span className="text-xs text-muted-foreground"> / {target}</span>
                                                    </td>
                                                    <td className="py-3 px-2 text-center">
                                                        {isGreen ? (
                                                            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Atingiu a Barra" />
                                                        ) : (
                                                            <span className="inline-block w-3 h-3 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" title="Abaixo da Barra" />
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
