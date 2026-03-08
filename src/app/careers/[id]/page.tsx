import { getPublicJobById } from '@/app/actions/careers'
import Link from 'next/link'
import { ArrowLeft, MapPin, Building2, Clock, DollarSign, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function JobDetailPage({ params }: { params: { id: string } }) {
    const { job } = await getPublicJobById(params.id)

    if (!job) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Vaga não encontrada</h1>
                    <p className="text-muted-foreground mb-6">Esta vaga pode ter sido encerrada ou não existe.</p>
                    <Link href="/careers" className="text-primary hover:underline font-medium">
                        ← Voltar para vagas
                    </Link>
                </div>
            </div>
        )
    }

    const formatSalary = (min?: number | null, max?: number | null) => {
        if (!min && !max) return null
        const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
        if (min && max) return `${fmt(min)} - ${fmt(max)}`
        if (min) return `A partir de ${fmt(min)}`
        if (max) return `Até ${fmt(max)}`
        return null
    }

    const salary = formatSalary(job.salary_min, job.salary_max)

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Link href="/careers" className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 mb-4">
                        <ArrowLeft className="w-4 h-4" /> Todas as vagas
                    </Link>

                    <h1 className="text-3xl font-black text-foreground tracking-tight">{job.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {job.organizations?.name && (
                            <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" /> {job.organizations.name}
                            </span>
                        )}
                        {job.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" /> {job.location}
                            </span>
                        )}
                        {job.employment_type && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" /> {job.employment_type}
                            </span>
                        )}
                        {salary && (
                            <span className="flex items-center gap-1 text-primary font-medium">
                                <DollarSign className="w-4 h-4" /> {salary}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {job.description && (
                        <section>
                            <h2 className="text-lg font-bold text-foreground mb-3">Sobre a Vaga</h2>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
                        </section>
                    )}

                    {job.responsibilities && job.responsibilities.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold text-foreground mb-3">Responsabilidades</h2>
                            <ul className="space-y-2">
                                {job.responsibilities.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {job.requirements && job.requirements.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold text-foreground mb-3">Requisitos</h2>
                            <ul className="space-y-2">
                                {job.requirements.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-8">
                        <h3 className="text-lg font-bold text-foreground mb-4">Interessado?</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Candidate-se agora e faça parte do nosso time.
                        </p>
                        <Button asChild className="w-full">
                            <Link href={`/careers/${job.id}/apply`}>
                                Candidatar-se →
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
