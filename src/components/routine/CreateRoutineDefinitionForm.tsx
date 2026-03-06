'use client'

import { useState } from 'react'
import { createRoutineDefinition } from '@/app/routine/actions'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function CreateRoutineDefinitionForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const title = formData.get('title') as string
        const frequency = formData.get('frequency') as 'daily' | 'weekly' | 'monthly'
        const targetValueRaw = formData.get('target_value')

        if (!title || !targetValueRaw) {
            setError('Preencha os campos obrigatórios.')
            setLoading(false)
            return
        }

        const res = await createRoutineDefinition({
            title,
            frequency,
            target_value: Number(targetValueRaw),
            description: formData.get('description') as string
        })

        if (!res.success) {
            setError(res.error || 'Erro ao criar a meta.')
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
                <label className="block text-xs font-semibold text-foreground mb-1 uppercase tracking-wider">
                    Indicador (O Que?)
                </label>
                <input
                    name="title"
                    placeholder="Ex: Ligações Frias"
                    className="w-full bg-muted border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1 uppercase tracking-wider">
                        Alvo Numérico
                    </label>
                    <input
                        type="number"
                        name="target_value"
                        placeholder="Ex: 10"
                        min="0"
                        step="0.01"
                        className="w-full bg-muted border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1 uppercase tracking-wider">
                        Frequência
                    </label>
                    <select
                        name="frequency"
                        className="w-full bg-muted border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
                    >
                        <option value="daily">Diária</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                    </select>
                </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? 'Salvando...' : 'Adicionar Barra'}
            </Button>
        </form>
    )
}
