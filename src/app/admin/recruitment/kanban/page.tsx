import Link from 'next/link'
import { getCandidates } from '../../actions/recruitment-candidates'
import { getJobs } from '../../actions/recruitment-jobs'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import KanbanView from './KanbanView'

export const dynamic = 'force-dynamic'

export default async function KanbanPage() {
    const [candidatesResult, jobsResult] = await Promise.all([
        getCandidates(),
        getJobs()
    ])

    const candidates = candidatesResult.success ? candidatesResult.data || [] : []
    const jobs = jobsResult.success ? jobsResult.data || [] : []

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col">
            <header className="bg-card border-b px-6 py-4 shadow-sm">
                <div className="max-w-[1600px] mx-auto w-full flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="icon">
                            <Link href="/admin/recruitment">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Pipeline de Candidatos</h1>
                            <p className="text-xs text-muted-foreground">Arraste para mudar etapas (Em breve) | Ações Rápidas ativas</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/recruitment/jobs">Gerenciar Vagas</Link>
                        </Button>
                        <select className="bg-background border rounded-md px-3 py-1 text-sm outline-none focus:ring-2 ring-primary/20">
                            <option>Todas as Vagas</option>
                            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                <KanbanView initialCandidates={candidates} jobs={jobs} />
            </main>
        </div>
    )
}
