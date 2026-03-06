import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/supabase/auth'
import Link from 'next/link'
import { BrainCircuit, Star, ArrowRight } from 'lucide-react'
import { EmptyState } from '@/components/ui/feedback'

async function getTalentPool() {
    const supabase = createServerSupabaseClient()

    // Exigirá que somente pessoas com auth tenham acesso
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return []

    // Pegamos apenas usuários ativos.
    const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role:roles(name)')
        .eq('status', 'active')
        .limit(20)

    if (error) {
        console.error('Erro ao buscar pool de talentos:', error)
        return []
    }

    return data
}

export default async function SuccessionPlanningPage() {
    await requirePermission('users.manage') // Permissão de visualização padrão
    const talents = await getTalentPool()

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-indigo-500" />
                        Planejamento de Sucessão (IA)
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Identifique e analise talentos com alto potencial para posições de liderança e promoção usando Inteligência Artificial.
                    </p>
                </div>
            </div>

            {talents.length === 0 ? (
                <EmptyState
                    icon={<Star className="w-12 h-12 text-muted-foreground/30" />}
                    title="Nenhum talento avaliado"
                    description="Ainda não existem usuários ativos elegíveis para mapeamento de sucessão."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {talents.map((talent) => {
                        const role = talent.role as any
                        const roleName = Array.isArray(role) ? role[0]?.name : role?.name

                        return (
                            <div key={talent.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col items-start relative group">
                                <div className="flex items-center gap-3 w-full mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                        {talent.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 truncate">
                                        <h3 className="font-semibold text-foreground truncate">{talent.full_name}</h3>
                                        <p className="text-xs text-muted-foreground truncate">{talent.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-6">
                                    <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground uppercase">
                                        {roleName || 'Colaborador'}
                                    </span>
                                </div>

                                <Link
                                    href={`/admin/analytics/succession/${talent.id}`}
                                    className="mt-auto w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg transition-colors border border-indigo-200 dark:border-indigo-500/20"
                                >
                                    <BrainCircuit className="w-4 h-4" />
                                    Gerar Plano via IA
                                </Link>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

