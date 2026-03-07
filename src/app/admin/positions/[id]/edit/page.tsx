import Link from 'next/link'
import PositionForm from '../../PositionForm'
import { getOrganizations } from '../../../actions/organizations'
import { getLevels } from '../../../actions/levels'
import { getPositions } from '../../../actions/positions'
import { notFound } from 'next/navigation'

interface PageProps {
    params: {
        id: string
    }
}

export default async function EditPositionPage({ params }: PageProps) {
    const [orgsResult, levelsResult, positionsResult] = await Promise.all([
        getOrganizations(),
        getLevels(),
        getPositions()
    ])

    const positions = positionsResult.success ? (positionsResult.data as any[]) : []
    const positionToEdit = positions.find(p => p.id === params.id)

    if (!positionToEdit) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-card shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/admin/positions" className="text-primary hover:text-primary/80 text-sm font-medium">
                        ← Voltar
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground mt-1">Editar Cargo</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PositionForm
                    organizations={orgsResult.success ? (orgsResult.data as any) : []}
                    levels={levelsResult.success ? (levelsResult.data as any) : []}
                    initialData={positionToEdit}
                />
            </main>
        </div>
    )
}
