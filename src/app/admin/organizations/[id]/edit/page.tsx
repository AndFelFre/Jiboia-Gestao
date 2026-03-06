'use client'

import { useEffect, useState } from 'react'
import { updateOrganization } from '../../../actions/organizations'
import { useRouter } from 'next/navigation'
import { OrganizationForm } from '@/components/admin/OrganizationForm'
import { OrganizationInput } from '@/validations/schemas'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { ErrorState } from '@/components/ui/feedback'
import { Loader2 } from 'lucide-react'

export default function EditOrganizationPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [initialData, setInitialData] = useState<any>(null)
    const [loadingInitial, setLoadingInitial] = useState(true)
    const [fetchError, setFetchError] = useState('')

    useEffect(() => {
        async function loadOrg() {
            try {
                const supabase = createBrowserSupabaseClient()
                const { data, error } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', params.id)
                    .single()

                if (error) throw error
                if (data) setInitialData(data)
            } catch (err: unknown) {
        const error = err as Error;
                setFetchError(error.message || 'Erro ao carregar organização')
            } finally {
                setLoadingInitial(false)
            }
        }
        loadOrg()
    }, [params.id])

    const handleUpdate = async (data: OrganizationInput) => {
        // Reutiliza a action já existente de atualizar a ORG passando o ID
        const result = await updateOrganization(params.id, data)
        if (result.success) {
            router.push('/admin/organizations')
            router.refresh()
        }
        return result
    }

    if (loadingInitial) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (fetchError || !initialData) {
        return (
            <div className="min-h-screen bg-background p-8">
                <ErrorState title="Não foi possível carregar" description={fetchError} />
                <div className="mt-4 flex justify-center">
                    <Link href="/admin/organizations" className="text-primary hover:underline">Voltar para lista</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-card shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/admin/organizations" className="text-primary hover:text-primary/80 text-sm">
                        ← Voltar
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground mt-1">Editar Organização</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <OrganizationForm
                    title="Configurações e Branding"
                    actionLabel="Salvar Alterações"
                    initialData={initialData}
                    onSubmit={handleUpdate}
                />
            </main>
        </div>
    )
}
