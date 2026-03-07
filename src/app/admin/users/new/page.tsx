import Link from 'next/link'
import UserForm from '../UserForm'
import { getOrganizations } from '../../actions/organizations'
import { getUnits } from '../../actions/units'
import { getPositions } from '../../actions/positions'

// Reutilizamos a lógica de roles da página principal
async function getRoles() {
    try {
        const { createServerSupabaseClient } = await import('@/lib/supabase/server')
        const supabase = createServerSupabaseClient()
        const { data, error } = await supabase.from('roles').select('*').order('name')
        if (error) throw error
        return { success: true, data }
    } catch {
        return { success: false, data: [] }
    }
}

export default async function NewUserPage() {
    const [orgsResult, unitsResult, positionsResult, rolesResult] = await Promise.all([
        getOrganizations(),
        getUnits(),
        getPositions(),
        getRoles()
    ])

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-card shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/admin/users" className="text-primary hover:text-primary/80 text-sm">
                        ← Voltar
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground mt-1">Convidar Novo Usuário</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <UserForm
                    organizations={orgsResult.success ? (orgsResult.data as any) : []}
                    units={unitsResult.success ? (unitsResult.data as any) : []}
                    positions={positionsResult.success ? (positionsResult.data as any) : []}
                    roles={rolesResult.success ? (rolesResult.data as any) : []}
                />
            </main>
        </div>
    )
}
