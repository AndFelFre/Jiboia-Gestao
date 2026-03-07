import Link from 'next/link'
import TrackForm from '../../TrackForm'
import { getOrganizations } from '../../../actions/organizations'
import { getTracks } from '../../../actions/tracks'
import { notFound } from 'next/navigation'

interface PageProps {
    params: {
        id: string
    }
}

export default async function EditTrackPage({ params }: PageProps) {
    const [orgsResult, tracksResult] = await Promise.all([
        getOrganizations(),
        getTracks()
    ])

    const tracks = tracksResult.success ? (tracksResult.data as any[]) : []
    const trackToEdit = tracks.find(t => t.id === params.id)

    if (!trackToEdit) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-card shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/admin/tracks" className="text-primary hover:text-primary/80 text-sm font-medium">
                        ← Voltar
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground mt-1">Editar Trilha</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <TrackForm
                    organizations={orgsResult.success ? (orgsResult.data as any) : []}
                    initialData={trackToEdit}
                />
            </main>
        </div>
    )
}
