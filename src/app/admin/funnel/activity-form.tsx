'use client'

import { useState } from 'react'
import { createFunnelActivity } from '@/app/actions/funnel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function FunnelActivityForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        setSuccess(false)

        const name = formData.get('name') as string
        const sequence = parseInt(formData.get('sequence') as string || '0', 10)

        if (!name) {
            setError('O nome da atividade é obrigatório.')
            setLoading(false)
            return
        }

        const res = await createFunnelActivity({ name, sequence })

        if (!res.success) {
            setError(res.error || 'Erro ao criar atividade.')
        } else {
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        }
        setLoading(false)
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm sticky top-8">
            <h2 className="text-xl font-semibold mb-6 text-foreground">Nova Atividade</h2>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 border border-destructive/20">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-500/10 text-emerald-500 text-sm p-3 rounded-md mb-4 border border-emerald-500/20">
                    Atividade cadastrada com sucesso!
                </div>
            )}

            <form action={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name">Nome da Atividade</Label>
                    <Input id="name" name="name" placeholder="Ex: Prospecção Telefônica" required className="mt-1" />
                </div>

                <div>
                    <Label htmlFor="sequence">Ordem/Sequência</Label>
                    <Input id="sequence" name="sequence" type="number" defaultValue="0" className="mt-1" />
                    <p className="text-[10px] text-muted-foreground mt-1">Define em qual ordem a atividade aparece para o colaborador.</p>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={loading}>
                    {loading ? 'Cadastrando...' : 'Adicionar ao Funil'}
                </Button>
            </form>
        </div>
    )
}
