import { createServerSupabaseClientReadOnly } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Target, AlertCircle } from 'lucide-react'
import { FunnelInputForm } from '@/components/routine/FunnelInputForm'
import { FunnelProgressCard } from '@/components/routine/FunnelProgressCard'

export const dynamic = 'force-dynamic'

export default async function RoutineFunnelPage() {
    const supabase = createServerSupabaseClientReadOnly()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('id, org_id')
        .eq('id', user.id)
        .single()

    if (!userData) redirect('/login')

    // 1. Busca metas da Empresa
    const { data: definitions, error: defError } = await supabase
        .from('routine_definitions')
        .select('*')
        .eq('org_id', userData.org_id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

    if (defError) console.error(defError)

    // 2. Busca Input de Hoje do Usuário
    const today = new Date().toISOString().split('T')[0]
    const { data: todayInputs, error: inputError } = await supabase
        .from('routine_inputs')
        .select('routine_definition_id, achieved_value, notes')
        .eq('user_id', user.id)
        .eq('input_date', today)

    if (inputError) console.error(inputError)

    // Merge dos dados para a View
    const metrics = (definitions || []).map(def => {
        const input = todayInputs?.find(i => i.routine_definition_id === def.id)
        return {
            definition: def,
            today_value: input ? Number(input.achieved_value) : 0,
            notes: input?.notes || ''
        }
    })

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
                <header className="mb-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 text-primary flex items-center justify-center rounded-xl">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-foreground">Cockpit da Rotina</h2>
                        <p className="text-muted-foreground mt-1">
                            &quot;Não deixe para amanhã as atividades que você pode registrar hoje.&quot; – O registro diário é a chave para um forecast preciso.
                        </p>
                    </div>
                </header>

                {metrics.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-8 text-center max-w-2xl mx-auto mt-20 shadow-sm">
                        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">Sem metas diárias configuradas!</h3>
                        <p className="text-muted-foreground">A liderança ainda não parametrizou nenhuma meta de engajamento diária/semanal para o seu perfil.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Status Visual (Cards/Termômetros) */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
                                <h3 className="text-xl font-bold text-foreground mb-6">Status de Hoje</h3>
                                <FunnelProgressCard metrics={metrics} />
                            </div>
                        </div>

                        {/* Formulário de Input */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-foreground mb-6">Apontamento de Métricas</h3>
                                <FunnelInputForm metrics={metrics} />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
