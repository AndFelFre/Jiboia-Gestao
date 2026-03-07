'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { positionSchema, type PositionInput } from '@/validations/schemas'
import { createPosition, updatePosition } from '../actions/positions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Organization {
    id: string
    name: string
}

interface Level {
    id: string
    name: string
    sequence: number
    org_id: string
}

interface Position {
    id: string;
    title: string;
    level_id?: string | null;
    description?: string | null;
    org_id: string;
}

interface PositionFormProps {
    organizations: Organization[]
    levels: Level[]
    initialData?: Position
}

export default function PositionForm({ organizations, levels, initialData }: PositionFormProps) {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedOrg, setSelectedOrg] = useState(initialData?.org_id || '')
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PositionInput>({
        resolver: zodResolver(positionSchema),
        defaultValues: initialData ? {
            title: initialData.title,
            level_id: initialData.level_id || undefined,
            description: initialData.description || undefined,
        } : undefined
    })

    const filteredLevels = selectedOrg
        ? levels.filter(l => l.org_id === selectedOrg)
        : []

    const onSubmit = async (data: PositionInput) => {
        if (!selectedOrg) {
            setError('Selecione uma organização')
            return
        }

        setLoading(true)
        setError('')

        const result = initialData
            ? await updatePosition(initialData.id, { ...data, org_id: selectedOrg })
            : await createPosition({ ...data, org_id: selectedOrg })

        if (result.success) {
            router.push('/admin/positions')
            router.refresh()
        } else {
            setError(result.error || 'Erro ao salvar cargo')
            setLoading(false)
        }
    }

    if (organizations.length === 0 && !initialData) {
        return (
            <div className="bg-yellow-500/10 border border-yellow-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-yellow-600 mb-2">⚠️ Atenção</h2>
                <p className="text-yellow-600 mb-4">Você precisa criar uma organização antes de criar cargos.</p>
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
                    <p className="text-destructive font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label htmlFor="org_id" className="block text-sm font-medium text-foreground mb-1">Organização *</label>
                    <select
                        id="org_id"
                        value={selectedOrg}
                        disabled={!!initialData}
                        onChange={(e) => setSelectedOrg(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-muted"
                    >
                        <option value="">Selecione uma organização...</option>
                        {organizations.map((org) => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">Título do Cargo *</label>
                    <input
                        {...register('title')}
                        type="text"
                        id="title"
                        className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Ex: Analista de Vendas"
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="level_id" className="block text-sm font-medium text-foreground mb-1">Nível de Carreira (opcional)</label>
                    <select
                        {...register('level_id')}
                        id="level_id"
                        disabled={!selectedOrg}
                        className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-muted"
                    >
                        <option value="">Selecione um nível...</option>
                        {filteredLevels.map((level) => (
                            <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                    </select>
                    {!selectedOrg && (
                        <p className="mt-1 text-xs text-muted-foreground">Selecione uma organização primeiro</p>
                    )}
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">Descrição</label>
                    <textarea
                        {...register('description')}
                        id="description"
                        rows={4}
                        className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Descreva as responsabilidades e requisitos do cargo..."
                    />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Link
                        href="/admin/positions"
                        className="px-4 py-2 border border-input rounded text-foreground hover:bg-muted font-medium"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 font-bold shadow-sm"
                    >
                        {loading ? 'Salvando...' : initialData ? 'Atualizar Cargo' : 'Criar Cargo'}
                    </button>
                </div>
            </form>
        </div>
    )
}
