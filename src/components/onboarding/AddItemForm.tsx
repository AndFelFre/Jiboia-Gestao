'use client'

import { useState } from 'react'
import { addOnboardingItem } from '@/app/admin/actions/onboarding'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function AddItemForm({ templateId }: { templateId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const sequence = parseInt(formData.get('sequence') as string) || 0

        if (!title) {
            setError('O título do item é obrigatório.')
            setLoading(false)
            return
        }

        const res = await addOnboardingItem(templateId, title, description, sequence)

        if (!res.success) {
            setError(res.error || 'Erro ao adicionar item.')
        } else {
            e.currentTarget.reset()
            setIsOpen(false)
            router.refresh()
        }

        setLoading(false)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
                <Plus className="w-4 h-4" /> Adicionar Novo Item
            </button>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="bg-background border border-border rounded-lg p-4 relative">
            <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-xs"
            >
                Cancelar
            </button>

            <h5 className="font-bold text-sm mb-3">Novo Item do Checklist</h5>

            {error && (
                <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-md mb-3">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                <div className="col-span-12 md:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Ordem</label>
                    <input
                        type="number"
                        name="sequence"
                        placeholder="Ex: 1"
                        className="w-full bg-muted border border-border text-foreground rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-ring outline-none"
                        required
                    />
                </div>
                <div className="col-span-12 md:col-span-10">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Título da Tarefa</label>
                    <input
                        type="text"
                        name="title"
                        placeholder="Ex: Assistir vídeo Institucional (D0)"
                        className="w-full bg-muted border border-border text-foreground rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-ring outline-none"
                        required
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Descrição / Instruções</label>
                <textarea
                    name="description"
                    rows={2}
                    placeholder="Instruções adicionais de como o usuário deve concluir isso..."
                    className="w-full bg-muted border border-border text-foreground rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-ring outline-none resize-none"
                />
            </div>

            <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Item'}
            </Button>
        </form>
    )
}
