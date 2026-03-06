import { getFunnelActivities } from '@/app/actions/funnel'
import { requirePermission } from '@/lib/supabase/auth'
import { FunnelActivityForm } from './activity-form'

export default async function AdminFunnelPage() {
    await requirePermission('org.manage')
    const result = await getFunnelActivities({})
    const activities: any[] = result.success && result.data ? (result.data as any) : []

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Gestão do Funil de Atividades (Forecast)</h1>
                <p className="text-muted-foreground mt-1">
                    Defina as atividades diárias que os colaboradores devem registrar (ex: Visitas, Prospecções, Fechamentos).
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <FunnelActivityForm />
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-border bg-muted/30">
                            <h2 className="font-semibold text-foreground">Catálogo de Atividades</h2>
                        </div>

                        {activities.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground italic">Nenhuma atividade configurada.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {activities.map((a) => (
                                    <div key={a.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 text-primary font-bold w-8 h-8 rounded-full flex items-center justify-center text-xs">
                                                {a.sequence}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">{a.name}</p>
                                                <p className="text-xs text-muted-foreground">{a.is_active ? 'Ativo' : 'Inativo'}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Criado em: {new Date(a.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

