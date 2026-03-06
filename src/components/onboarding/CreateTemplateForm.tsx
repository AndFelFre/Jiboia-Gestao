'use client'

import { useState } from 'react'
import { createOnboardingTemplate } from '@/app/admin/actions/onboarding'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function CreateTemplateForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const description = formData.get('description') as string

        if (!name) {
            setError('O nome da trilha é obrigatório.')
            setLoading(false)
            return
        }

        const res = await createOnboardingTemplate(name, description)

        if (!res.success) {
            setError(res.error || 'Erro ao criar a trilha.')
        } else {
            e.currentTarget.reset()
            router.refresh()
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-1">
                    Nome da Trilha
                </label>
                <input
                    id="name"
                    name="name"
                    placeholder="Ex: Trilha Dev, Recepção D0-D30..."
                    className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
                    required
                />
            </div>

            <div>
                <label htmlFor="desc" className="block text-sm font-semibold text-foreground mb-1">
                    Descrição Breve
                </label>
                <textarea
                    id="desc"
                    name="description"
                    rows={2}
                    placeholder="Para quais cargos essa trilha é aplicável?"
                    className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none resize-none"
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? 'Criando...' : 'Salvar Trilha'}
            </Button>
        </form>
    )
}
