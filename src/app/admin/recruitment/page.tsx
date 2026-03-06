import Link from 'next/link'
import { getJobs } from '../actions/recruitment-jobs'
import { getCandidates } from '../actions/recruitment-candidates'
import { EmptyState, ErrorState } from '@/components/ui/feedback'
import { Button } from '@/components/ui/button'
import { Plus, LayoutGrid, List } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RecruitmentPage() {
    const [jobsResult, candidatesResult] = await Promise.all([
        getJobs(),
        getCandidates()
    ])

    const jobs = jobsResult.success && jobsResult.data ? jobsResult.data : []
    const candidates = candidatesResult.success && candidatesResult.data ? candidatesResult.data : []

    const openJobs = jobs.filter(j => j.status === 'open')

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="bg-card shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <Link href="/admin" className="text-primary hover:text-primary/80 text-sm">
                                ← Admin
                            </Link>
                            <h1 className="text-2xl font-bold text-foreground mt-1">Recrutamento</h1>
                        </div>
                        <div className="flex space-x-3">
                            <Button asChild variant="outline">
                                <Link href="/admin/recruitment/kanban">
                                    <LayoutGrid className="mr-2 h-4 w-4" />
                                    Visualização Kanban
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href="/admin/recruitment/jobs/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nova Vaga
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-card rounded-xl border p-6">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Vagas Abertas</p>
                        <p className="text-4xl font-bold mt-2">{openJobs.length}</p>
                    </div>
                    <div className="bg-card rounded-xl border p-6">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Candidatos</p>
                        <p className="text-4xl font-bold mt-2">{candidates.length}</p>
                    </div>
                    <div className="bg-card rounded-xl border p-6">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Aguardando Triagem</p>
                        <p className="text-4xl font-bold mt-2 text-yellow-600">
                            {candidates.filter(c => c.stage === 'new' || c.stage === 'screening').length}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Vagas Ativas</h2>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/admin/recruitment/jobs">Ver todas</Link>
                            </Button>
                        </div>

                        {jobs.length === 0 ? (
                            <EmptyState
                                title="Nenhuma vaga aberta"
                                description="As oportunidades de carreira da sua empresa aparecerão aqui."
                                action={
                                    <Button asChild variant="outline">
                                        <Link href="/admin/recruitment/jobs/new">Criar Primeira Vaga</Link>
                                    </Button>
                                }
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {jobs.filter(j => j.status !== 'closed').map((job) => (
                                    <Card key={job.id} className="hover:border-primary/50 transition-colors">
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg leading-tight">{job.title}</h3>
                                                <Badge variant={job.priority} />
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {job.location || 'Híbrido'} • {job.employment_type || 'CLT'}
                                            </p>
                                            <div className="flex items-center justify-between mt-auto">
                                                <span className="text-sm font-medium">
                                                    {candidates.filter(c => c.job_id === job.id).length} candidatos
                                                </span>
                                                <Button asChild size="sm" variant="secondary">
                                                    <Link href={`/admin/recruitment/jobs/${job.id}`}>Ver Detalhes</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

function Badge({ variant }: { variant: string }) {
    const colors = {
        urgent: 'bg-destructive/10 text-destructive border-destructive/20',
        high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
        normal: 'bg-primary/10 text-primary border-primary/20',
        low: 'bg-muted text-muted-foreground border-border'
    }
    const labels = {
        urgent: 'Urgente',
        high: 'Prioridade Alta',
        normal: 'Normal',
        low: 'Baixa'
    }
    return (
        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${colors[variant as keyof typeof colors] || colors.low}`}>
            {labels[variant as keyof typeof labels] || 'Normal'}
        </span>
    )
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`bg-card rounded-xl border shadow-sm ${className}`}>
            {children}
        </div>
    )
}
