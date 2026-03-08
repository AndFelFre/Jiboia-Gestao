import { getPublicJobs } from '@/app/actions/careers'
import Link from 'next/link'
import { Briefcase, MapPin, Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Carreiras | Jiboia Gestão',
    description: 'Encontre a vaga perfeita para sua carreira. Veja nossas oportunidades abertas.',
}

export default async function CareersPage() {
    const { jobs } = await getPublicJobs()

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="max-w-5xl mx-auto px-4 py-12 text-center">
                    <h1 className="text-4xl font-black text-foreground tracking-tight">
                        Junte-se ao nosso time
                    </h1>
                    <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
                        Confira as vagas abertas e dê o próximo passo na sua carreira.
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-10">
                {jobs.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-2xl border border-border">
                        <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground">Nenhuma vaga aberta no momento</h2>
                        <p className="text-muted-foreground mt-2">Fique de olho! Novas oportunidades surgem frequentemente.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job: any) => (
                            <Link
                                key={job.id}
                                href={`/careers/${job.id}`}
                                className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                            {job.title}
                                        </h2>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            {job.organizations?.name && (
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-4 h-4" />
                                                    {job.organizations.name}
                                                </span>
                                            )}
                                            {job.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {job.location}
                                                </span>
                                            )}
                                            {job.employment_type && (
                                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                                                    {job.employment_type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Ver detalhes →
                                    </span>
                                </div>
                                {job.description && (
                                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                                        {job.description}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
