'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { unitSchema, type UnitInput } from '@/validations/schemas'
import { createUnit, updateUnit } from '../actions/units'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Organization {
    id: string
    name: string
}

interface Unit {
    id: string;
    name: string;
    org_id: string;
    parent_id?: string | null;
}

interface UnitFormProps {
    organizations: Organization[]
    units: Unit[]
    initialData?: Unit
}

import { toast } from '@/components/ui/feedback'

export default function UnitForm({ organizations, units, initialData }: UnitFormProps) {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedOrg, setSelectedOrg] = useState(initialData?.org_id || '')
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UnitInput>({
        resolver: zodResolver(unitSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            parent_id: initialData.parent_id || undefined,
        } : undefined
    })

    // Filtros baseados na organização selecionada
    const filteredUnits = selectedOrg
        ? units.filter(u => u.org_id === selectedOrg && u.id !== initialData?.id)
        : []

    const onSubmit = async (data: UnitInput) => {
        if (!selectedOrg) {
            toast.error('Selecione uma organização')
            setError('Selecione uma organização')
            return
        }

        setLoading(true)
        setError('')

        try {
            const result = initialData
                ? await updateUnit(initialData.id, { ...data, org_id: selectedOrg })
                : await createUnit({ ...data, org_id: selectedOrg })

            if (result.success) {
                toast.success(initialData ? 'Unidade atualizada com sucesso!' : 'Unidade criada com sucesso!')
                router.refresh()
                router.push('/admin/units')
            } else {
                toast.error(result.error || 'Erro ao salvar unidade')
                setError(result.error || 'Erro ao salvar unidade')
                setLoading(false)
            }
        } catch (err) {
            toast.error('Erro inesperado ao salvar unidade')
            setError('Erro inesperado ao salvar unidade')
            setLoading(false)
        }
    }

    if (organizations.length === 0 && !initialData) {
        return (
            <div className="bg-yellow-500/10 border border-yellow-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-yellow-600 mb-2">⚠️ Atenção</h2>
                <p className="text-yellow-600 mb-4">
                    Você precisa criar uma organização antes de criar unidades.
                </p>
                <Link
                    href="/admin/organizations/new"
                    className="text-primary hover:text-primary/80 font-medium"
                >
                    Criar organização →
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-card rounded-lg shadow-sm border p-6">
            {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded">
                    <p className="text-destructive">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label htmlFor="org_id" className="block text-sm font-medium text-foreground">
                        Organização *
                    </label>
                    <select
                        id="org_id"
                        value={selectedOrg}
                        disabled={!!initialData}
                        onChange={(e) => setSelectedOrg(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-muted"
                    >
                        <option value="">Selecione uma organização...</option>
                        {organizations.map((org) => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground">
                        Nome da Unidade *
                    </label>
                    <input
                        {...register('name')}
                        type="text"
                        id="name"
                        className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Ex: Filial São Paulo"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="parent_id" className="block text-sm font-medium text-foreground">
                        Unidade Pai (opcional)
                    </label>
                    <select
                        {...register('parent_id')}
                        id="parent_id"
                        disabled={!selectedOrg}
                        className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-muted"
                    >
                        <option value="">Nenhuma (Unidade Matriz)</option>
                        {filteredUnits.map((unit) => (
                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {!selectedOrg && 'Selecione uma organização primeiro'}
                    </p>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <Link
                        href="/admin/units"
                        className="px-4 py-2 border border-input rounded text-foreground hover:bg-muted"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 font-medium"
                    >
                        {loading ? 'Salvando...' : initialData ? 'Atualizar Unidade' : 'Criar Unidade'}
                    </button>
                </div>
            </form>
        </div>
    )
}
