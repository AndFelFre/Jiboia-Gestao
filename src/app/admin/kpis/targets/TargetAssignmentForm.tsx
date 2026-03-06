'use client'

import { useState } from 'react'
import { assignKpiTarget } from '@/app/actions/kpis'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { User, KpiDefinition } from '@/types'

export function TargetAssignmentForm({ users, kpis }: { users: Partial<User>[], kpis: KpiDefinition[] }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        setSuccess(false)

        const user_id = formData.get('user_id') as string
        const kpi_id = formData.get('kpi_id') as string
        const target_value = parseFloat(formData.get('target_value') as string)
        const weight = parseFloat(formData.get('weight') as string)
        const period_start = formData.get('period_start') as string
        const period_end = formData.get('period_end') as string

        if (!user_id || !kpi_id || !period_start || !period_end) {
            setError('Preencha todos os campos obrigatórios.')
            setLoading(false)
            return
        }

        const res = await assignKpiTarget({
            user_id,
            kpi_id,
            target_value,
            weight,
            period_start,
            period_end
        })

        if (!res.success) {
            setError(res.error || 'Erro ao atribuir meta.')
        } else {
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        }
        setLoading(false)
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm sticky top-8">
            <h2 className="text-xl font-semibold mb-6 text-foreground">Atribuir Nova Meta</h2>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 border border-destructive/20">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-500/10 text-emerald-500 text-sm p-3 rounded-md mb-4 border border-emerald-500/20">
                    Meta atribuída com sucesso!
                </div>
            )}

            <form action={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="user_id">Colaborador</Label>
                    <select
                        id="user_id"
                        name="user_id"
                        required
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="">Selecione o colaborador...</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label htmlFor="kpi_id">Indicador (KPI)</Label>
                    <select
                        id="kpi_id"
                        name="kpi_id"
                        required
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="">Selecione o KPI...</option>
                        {kpis.map((k) => (
                            <option key={k.id} value={k.id}>{k.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="target_value">Valor da Meta</Label>
                        <Input id="target_value" name="target_value" type="number" step="0.01" placeholder="Ex: 10000" required className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="weight">Peso (0.1 a 10)</Label>
                        <Input id="weight" name="weight" type="number" step="0.1" defaultValue="1" required className="mt-1" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="period_start">Início do Período</Label>
                        <Input id="period_start" name="period_start" type="date" required className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="period_end">Fim do Período</Label>
                        <Input id="period_end" name="period_end" type="date" required className="mt-1" />
                    </div>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={loading}>
                    {loading ? 'Atribuindo...' : 'Atribuir Meta'}
                </Button>
            </form>
        </div>
    )
}
