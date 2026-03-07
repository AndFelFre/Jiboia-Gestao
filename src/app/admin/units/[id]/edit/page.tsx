import Link from 'next/link'
import UnitForm from '../../UnitForm'
import { getOrganizations } from '../../../actions/organizations'
import { getUnits } from '../../../actions/units'
import { notFound } from 'next/navigation'

interface PageProps {
    params: {
        id: string
    }
}

export default async function EditUnitPage({ params }: PageProps) {
    const [orgsResult, unitsResult] = await Promise.all([
        getOrganizations(),
        getUnits()
    ])

    const units = unitsResult.success ? (unitsResult.data as any[]) : []
    const unitToEdit = units.find(u => u.id === params.id)

    if (!unitToEdit) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-card shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/admin/units" className="text-primary hover:text-primary/80 text-sm">
                        ← Voltar
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground mt-1">Editar Unidade</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <UnitForm
                    organizations={orgsResult.success ? (orgsResult.data as any) : []}
                    units={units}
                    initialData={unitToEdit}
                />
            </main>
        </div>
    )
}
