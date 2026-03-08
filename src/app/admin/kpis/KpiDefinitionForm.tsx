'use client'

import { useState } from 'react'
import { createKpiDefinition } from '@/app/actions/kpis'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Organization {
    id: string
    name: string
}

interface KpiDefinitionFormProps {
    organizations: Organization[]
    selectedOrgId?: string
}

export function KpiDefinitionForm({ organizations, selectedOrgId }: KpiDefinitionFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [orgId, setOrgId] = useState(selectedOrgId || '')

    async function handleSubmit(formData: FormData) {
        if (!orgId) {
            setError('Selecione uma organização antes de criar um KPI.')
            return
        }

        setLoading(true)
        setError(null)
        setSuccess(false)

        const name = formData.get('name') as string
        const key_slug = formData.get('key_slug') as string
        const data_type = formData.get('data_type') as any
        const is_reversed = formData.get('is_reversed') === 'on'
        const min_green = parseFloat(formData.get('min_green_threshold') as string)
        const min_yellow = parseFloat(formData.get('min_yellow_threshold') as string)
        const cap = parseFloat(formData.get('cap_percentage') as string)

        const res = await createKpiDefinition({
            org_id: orgId,
            name,
            key_slug,
            data_type,
            is_reversed,
            min_green_threshold: min_green,
            min_yellow_threshold: min_yellow,
            cap_percentage: cap,
        })

        if (!res.success) {
            setError(res.error || 'Erro ao criar KPI')
        } else {
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        }
        setLoading(false)
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm sticky top-8">
            <h2 className="text-xl font-semibold mb-6 text-foreground">Novo Indicador</h2>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 border border-destructive/20">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-500/10 text-emerald-500 text-sm p-3 rounded-md mb-4 border border-emerald-500/20">
                    KPI cadastrado com sucesso!
                </div>
            )}

            <form action={handleSubmit} className="space-y-4">
                {/* Seletor de Organização (Contexto) */}
                <div>
                    <Label htmlFor="org_id">Organização *</Label>
                    <select
                        id="org_id"
                        value={orgId}
                        onChange={(e) => setOrgId(e.target.value)}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                    >
                        <option value="">Selecione uma organização...</option>
                        {organizations.map((org) => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label htmlFor="name">Nome do Indicador</Label>
                    <Input id="name" name="name" placeholder="Ex: TPV Mensal" required className="mt-1" />
                </div>

                <div>
                    <Label htmlFor="key_slug">Chave (ID único)</Label>
                    <Input id="key_slug" name="key_slug" placeholder="Ex: tpv_m1" required className="mt-1" />
                    <p className="text-[10px] text-muted-foreground mt-1">Use apenas letras minúsculas e sublinhado.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="data_type">Tipo de Dado</Label>
                        <select
                            id="data_type"
                            name="data_type"
                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                        >
                            <option value="number">Número</option>
                            <option value="percentage">Percentual (%)</option>
                            <option value="currency">Moeda (R$)</option>
                            <option value="time">Tempo / Dias</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="cap_percentage">Teto (Cap %)</Label>
                        <Input id="cap_percentage" name="cap_percentage" type="number" defaultValue="150" className="mt-1" required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="min_green_threshold">Meta Verde (%)</Label>
                        <Input id="min_green_threshold" name="min_green_threshold" type="number" defaultValue="100" className="mt-1" required />
                    </div>
                    <div>
                        <Label htmlFor="min_yellow_threshold">Meta Amarela (%)</Label>
                        <Input id="min_yellow_threshold" name="min_yellow_threshold" type="number" defaultValue="80" className="mt-1" required />
                    </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <input
                        id="is_reversed"
                        name="is_reversed"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary bg-background"
                    />
                    <label htmlFor="is_reversed" className="text-sm font-medium leading-none">
                        Indicador Invertido?
                    </label>
                </div>
                <p className="text-[10px] text-muted-foreground pl-6">
                    Marque para KPIs onde **menor é melhor** (ex: Churn, Reclamações).
                </p>

                <Button type="submit" className="w-full mt-6" disabled={loading || !orgId}>
                    {loading ? 'Cadastrando...' : 'Criar Indicador'}
                </Button>
            </form>
        </div>
    )
}
