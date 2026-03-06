import Link from 'next/link'
import { getJobs } from '../../actions/recruitment-jobs'
import { getOrganizations } from '@/app/admin/actions/organizations'
import { getUnits } from '@/app/admin/actions/units'
import { getPositions } from '@/app/admin/actions/positions'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/feedback'
import { Plus, ChevronLeft, Search, Filter } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function JobsAdminPage() {
    const [jobsResult, orgsResult, unitsResult, positionsResult] = await Promise.all([
        getJobs(),
        getOrganizations(),
        getUnits(),
        getPositions()
    ])

    const jobs = jobsResult.success && jobsResult.data ? jobsResult.data : []
    const organizations = orgsResult.success && orgsResult.data ? orgsResult.data : []

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-card shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Button asChild variant="ghost" size="icon">
                                <Link href="/admin/recruitment">
                                    <ChevronLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Vagas</h1>
                                <p className="text-sm text-muted-foreground">Gerencie as oportunidades de trabalho.</p>
                            </div>
                        </div>
                        <Button asChild>
                            <Link href="/admin/recruitment/jobs/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Nova Vaga
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {jobs.length === 0 ? (
                    <EmptyState
                        title="Nenhuma vaga encontrada"
                        description="Comece criando sua primeira oportunidade de trabalho."
                        action={
                            <Button asChild variant="outline">
                                <Link href="/admin/recruitment/jobs/new">Criar Vaga</Link>
                            </Button>
                        }
                    />
                ) : (
                    <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    className="w-full pl-9 pr-4 py-1.5 text-sm bg-muted/50 rounded-md outline-none focus:ring-1 ring-primary/50"
                                    placeholder="Buscar vaga..."
                                />
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filtros
                            </Button>
                        </div>
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/30">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Título</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Prioridade</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-card divide-y divide-border">
                                {jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-foreground">{job.title}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {job.location} • {job.employment_type?.toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={job.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <PriorityText priority={job.priority} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button asChild variant="ghost" size="sm">
                                                <Link href={`/admin/recruitment/jobs/${job.id}`}>Editar</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const config: any = {
        open: { label: 'Aberta', class: 'bg-green-500/10 text-green-600 border-green-200' },
        paused: { label: 'Pausada', class: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
        closed: { label: 'Fechada', class: 'bg-destructive/10 text-destructive border-destructive/20' },
        draft: { label: 'Rascunho', class: 'bg-muted text-muted-foreground border-border' }
    }
    const { label, class: className } = config[status] || config.draft
    return (
        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold uppercase ${className}`}>
            {label}
        </span>
    )
}

function PriorityText({ priority }: { priority: string }) {
    const colors: any = {
        urgent: 'text-destructive',
        high: 'text-orange-600',
        normal: 'text-primary',
        low: 'text-muted-foreground'
    }
    return (
        <span className={colors[priority] || colors.normal}>
            {priority === 'urgent' ? 'Urgente' :
                priority === 'high' ? 'Alta' :
                    priority === 'normal' ? 'Normal' : 'Baixa'}
        </span>
    )
}
