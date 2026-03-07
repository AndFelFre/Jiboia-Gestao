import Link from 'next/link'
import LevelForm from '../../LevelForm'
import { getOrganizations } from '../../../actions/organizations'
import { getLevels } from '../../../actions/levels'
import { notFound } from 'next/navigation'

interface PageProps {
    params: {
        id: string
    }
}

export default async function EditLevelPage({ params }: PageProps) {
    const [orgsResult, levelsResult] = await Promise.all([
        getOrganizations(),
        getLevels()
    ])

    const levels = levelsResult.success ? (levelsResult.data as any[]) : []
    const levelToEdit = levels.find(l => l.id === params.id)

    if (!levelToEdit) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-card shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/admin/levels" className="text-primary hover:text-primary/80 text-sm">
                        ← Voltar
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground mt-1">Editar Nível de Carreira</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <LevelForm
                    organizations={orgsResult.success ? (orgsResult.data as any) : []}
                    initialData={levelToEdit}
                />
            </main>
        </div>
    )
}
