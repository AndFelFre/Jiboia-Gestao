import { createServerSupabaseClientReadOnly } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { CheckCircle, Clock } from 'lucide-react'
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist'

export const dynamic = 'force-dynamic'

export default async function EmployeeOnboardingPage() {
    const auth = await requireAuth()
    const supabase = createServerSupabaseClientReadOnly()

    // Busca o progresso atual do usuário agrupado por template
    const { data: progress, error } = await supabase
        .from('user_onboarding_progress')
        .select(`
            *,
            item:onboarding_items (id, title, description, sequence)
        `)
        .eq('user_id', auth.userId)
        .order('item(sequence)', { ascending: true }) // Notação PostgREST inline

    if (error) console.error('Erro ao buscar progresso:', error)

    const hasOnboarding = progress && progress.length > 0

    // Agrupa os itens por template (caso o fulano tenha mais de 1 trilha, como ex: Onboarding Geral + Onboarding Vendas)
    const templatesMap = new Map()

    if (hasOnboarding) {
        progress.forEach((p: any) => {
            const tempId = p.template.id
            if (!templatesMap.has(tempId)) {
                templatesMap.set(tempId, {
                    info: p.template,
                    items: []
                })
            }
            templatesMap.get(tempId).items.push({
                progress_id: p.id,
                status: p.status,
                ...p.item
            })
        })
    }

    const activeTemplates = Array.from(templatesMap.values())

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
                <header className="mb-10 text-center">
                    <div className="w-16 h-16 bg-primary/20 text-primary flex items-center justify-center rounded-2xl mx-auto mb-6">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">Sua Trilha de Integração</h2>
                    <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                        Bem-vindo(a)! Conclua os passos abaixo para mergulhar na nossa cultura e ferramentas de trabalho.
                    </p>
                </header>

                {!hasOnboarding ? (
                    <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center mt-12 shadow-sm">
                        <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-xl font-bold text-foreground">Tudo certo por aqui!</h3>
                        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                            O RH ainda não atribuiu nenhuma trilha de integração ao seu perfil, ou você já concluiu sua jornada.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {activeTemplates.map(templateGroup => {
                            // Cálculo da barra de progresso
                            const total = templateGroup.items.length
                            const done = templateGroup.items.filter((i: any) => i.status === 'completed').length
                            const percentage = Math.round((done / total) * 100)

                            // Ordena a lista localmente pra garantir a sequence ascending
                            const sortedItems = [...templateGroup.items].sort((a, b) => a.sequence - b.sequence)

                            return (
                                <div key={templateGroup.info.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                                    <div className="bg-muted min-h-32 p-8 border-b border-border/50 relative overflow-hidden">
                                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                                        <div className="relative z-10">
                                            <h3 className="text-2xl font-bold text-foreground">{templateGroup.info.name}</h3>
                                            <p className="text-muted-foreground mt-1 max-w-xl">{templateGroup.info.description}</p>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Seu Progresso</span>
                                            <span className="text-sm font-bold text-primary">{percentage}% concluído</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-8">
                                            <div
                                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>

                                        <div className="space-y-1 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                            <OnboardingChecklist items={sortedItems} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}

