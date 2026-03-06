import Link from 'next/link'
import { getEvaluations } from '@/app/admin/actions/performance-evaluations'
import { Button } from '@/components/ui/button'
import {
    ChevronLeft,
    Plus,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    ArrowUpRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function EvaluationsPage() {
    const result = await getEvaluations()
    const evaluations = result.success ? result.data || [] : []

    return (
        <div className="min-h-screen bg-muted/20">
            <header className="bg-card border-b px-6 py-4 shadow-sm mb-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="icon">
                            <Link href="/admin">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-xl font-bold text-foreground">Ciclos de Avaliação</h1>
                    </div>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Ciclo
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {evaluations.map((ev) => (
                        <Card key={ev.id} className="hover:shadow-md transition-shadow group relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${ev.status === 'completed' ? 'bg-green-500' :
                                ev.status === 'open' ? 'bg-blue-500' : 'bg-muted'
                                }`} />

                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border">
                                        {ev.cycle_name}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${ev.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        ev.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-muted'
                                        }`}>
                                        {ev.status}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold leading-tight">{ev.user?.full_name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{ev.user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                                {new Date(ev.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button asChild variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/performance/evaluations/${ev.id}`}>
                                                    Acessar <ArrowUpRight className="ml-1 h-3 w-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {evaluations.length === 0 && (
                        <div className="col-span-full py-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground/40">
                            <Clock className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest">Nenhum ciclo ativo no momento</p>
                            <Button variant="outline" size="sm" className="mt-4">Começar Agora</Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
