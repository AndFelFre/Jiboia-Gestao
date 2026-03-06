'use client'

import { useState } from 'react'
import { updateKpiResult } from '@/app/actions/kpis'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface KpiUpdateFormProps {
    targetId: string
    currentActual: number
    notes: string
}

export function KpiUpdateForm({ targetId, currentActual, notes }: KpiUpdateFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        setSuccess(false)

        const actualStr = formData.get('actual_value') as string
        const newNotes = (formData.get('notes') as string) || ''

        if (!actualStr) {
            setError('Preencha o valor realizado.')
            setLoading(false)
            return
        }

        const payload = {
            target_id: targetId,
            actual_value: parseFloat(actualStr),
            notes: newNotes
        }

        const res = await updateKpiResult(payload)

        if (!res.success) {
            setError(res.error || 'Erro ao registrar apontamento.')
        } else {
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        }

        setLoading(false)
    }

    return (
        <form action={handleSubmit} className="space-y-3">
            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
            {success && <div className="text-sm font-medium text-emerald-500">Atualizado com sucesso!</div>}

            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <Label htmlFor={`actual_${targetId}`} className="text-xs">Atualizar Realizado</Label>
                    <Input
                        id={`actual_${targetId}`}
                        name="actual_value"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={currentActual === 0 ? '' : currentActual}
                        placeholder="Ex: 15.5"
                        required
                        className="mt-1 h-9"
                    />
                </div>

                <div className="flex-1">
                    <Label htmlFor={`notes_${targetId}`} className="text-xs">Notas (Opcional)</Label>
                    <Input
                        id={`notes_${targetId}`}
                        name="notes"
                        type="text"
                        defaultValue={notes}
                        placeholder="Justificativa..."
                        className="mt-1 h-9"
                    />
                </div>

                <Button type="submit" size="sm" disabled={loading} className="h-9">
                    {loading ? 'Sal...' : 'Salvar'}
                </Button>
            </div>
        </form>
    )
}
