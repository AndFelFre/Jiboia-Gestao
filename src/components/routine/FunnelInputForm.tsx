'use client'

import { useState } from 'react'
import { saveRoutineInput } from '@/app/routine/actions'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface MetricData {
    definition: {
        id: string
        title: string
        target_value: number
        frequency: string
    }
    today_value: number
    notes: string
}

export function FunnelInputForm({ metrics }: { metrics: MetricData[] }) {
    const router = useRouter()
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
    const [statusMap, setStatusMap] = useState<Record<string, { type: 'success' | 'error', message: string }>>({})

    async function handleSave(e: React.FormEvent<HTMLFormElement>, definitionId: string) {
        e.preventDefault()
        setLoadingMap(prev => ({ ...prev, [definitionId]: true }))
        setStatusMap(prev => {
            const next = { ...prev }
            delete next[definitionId]
            return next
        })

        const formData = new FormData(e.currentTarget)
        const achievedRaw = formData.get('achieved_value')
        const notes = formData.get('notes') as string

        const achieved_value = achievedRaw ? Number(achievedRaw) : 0

        const res = await saveRoutineInput({
            routine_definition_id: definitionId,
            achieved_value,
            notes
        })

        if (!res.success) {
            setStatusMap(prev => ({ ...prev, [definitionId]: { type: 'error', message: res.error || 'Erro ao salvar' } }))
        } else {
            setStatusMap(prev => ({ ...prev, [definitionId]: { type: 'success', message: 'Salvo com sucesso!' } }))
            router.refresh()
            // Some com a tag docinho depois de 3 segundos
            setTimeout(() => {
                setStatusMap(prev => {
                    const next = { ...prev }
                    delete next[definitionId]
                    return next
                })
            }, 3000)
        }

        setLoadingMap(prev => ({ ...prev, [definitionId]: false }))
    }

    return (
        <div className="flex flex-col gap-6">
            {metrics.map(m => (
                <form
                    key={m.definition.id}
                    onSubmit={(e) => handleSave(e, m.definition.id)}
                    className="border border-border rounded-xl p-5 bg-background relative transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="font-bold text-foreground text-lg">{m.definition.title}</h4>
                            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider inline-block mt-1">
                                Meta {m.definition.frequency === 'daily' ? 'Diária' : m.definition.frequency === 'weekly' ? 'Semanal' : 'Mensal'}: {m.definition.target_value}
                            </span>
                        </div>

                        {statusMap[m.definition.id] && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${statusMap[m.definition.id].type === 'success'
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-destructive/10 text-destructive'
                                }`}>
                                {statusMap[m.definition.id].message}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <label className="text-xs font-semibold text-foreground mb-1 block">Atingido</label>
                            <input
                                type="number"
                                name="achieved_value"
                                defaultValue={m.today_value || ''}
                                placeholder="0"
                                min="0"
                                step="0.5"
                                className="w-full bg-muted border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="text-xs font-semibold text-foreground mb-1 block">Observações (Opcional)</label>
                            <input
                                type="text"
                                name="notes"
                                defaultValue={m.notes || ''}
                                placeholder="Breve justificativa..."
                                className="w-full bg-muted border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={loadingMap[m.definition.id]}
                        >
                            {loadingMap[m.definition.id] ? 'Salvando...' : 'Atualizar Barra'}
                        </Button>
                    </div>
                </form>
            ))}
        </div>
    )
}
