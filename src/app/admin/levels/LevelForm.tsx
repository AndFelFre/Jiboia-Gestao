'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { levelSchema, type LevelInput } from '@/validations/schemas'
import { createLevel, updateLevel } from '../actions/levels'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Organization {
    id: string
    name: string
}

interface Level {
    id: string;
    name: string;
    sequence: number;
    min_time_months: number;
    description?: string | null;
    org_id: string;
}

interface LevelFormProps {
    organizations: Organization[]
    initialData?: Level
}

import { toast } from '@/components/ui/feedback'

export default function LevelForm({ organizations, initialData }: LevelFormProps) {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedOrg, setSelectedOrg] = useState(initialData?.org_id || '')
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LevelInput>({
        resolver: zodResolver(levelSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            sequence: initialData.sequence,
            min_time_months: initialData.min_time_months,
            description: initialData.description || undefined,
        } : {
            sequence: 1,
            min_time_months: 6
        }
    })

    const onSubmit = async (data: LevelInput) => {
        if (!selectedOrg) {
            toast.error('Selecione uma organização')
            setError('Selecione uma organização')
            return
        }

        setLoading(true)
        setError('')

        try {
            const result = initialData
                ? await updateLevel(initialData.id, { ...data, org_id: selectedOrg })
                : await createLevel({ ...data, org_id: selectedOrg })

            if (result.success) {
                toast.success(initialData ? 'Nível atualizado com sucesso!' : 'Nível criado com sucesso!')
                router.refresh()
                router.push('/admin/levels')
            } else {
                toast.error(result.error || 'Erro ao salvar nível')
                setError(result.error || 'Erro ao salvar nível')
                setLoading(false)
            }
        } catch (err) {
            toast.error('Erro inesperado ao salvar nível')
            setError('Erro inesperado ao salvar nível')
            setLoading(false)
        }
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-foreground">
                            Nome do Nível *
                        </label>
                        <input
                            {...register('name')}
                            type="text"
                            id="name"
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="Ex: Júnior I"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="sequence" className="block text-sm font-medium text-foreground">
                            Sequência (Ordem) *
                        </label>
                        <input
                            {...register('sequence', { valueAsNumber: true })}
                            type="number"
                            id="sequence"
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                        {errors.sequence && (
                            <p className="mt-1 text-sm text-destructive">{errors.sequence.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="min_time_months" className="block text-sm font-medium text-foreground">
                            Tempo Mínimo (Meses) *
                        </label>
                        <input
                            {...register('min_time_months', { valueAsNumber: true })}
                            type="number"
                            id="min_time_months"
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                        {errors.min_time_months && (
                            <p className="mt-1 text-sm text-destructive">{errors.min_time_months.message}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-foreground">
                            Descrição (opcional)
                        </label>
                        <textarea
                            {...register('description')}
                            id="description"
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="Definição das responsabilidades deste nível..."
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <Link
                        href="/admin/levels"
                        className="px-4 py-2 border border-input rounded text-foreground hover:bg-muted"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 font-medium"
                    >
                        {loading ? 'Salvando...' : initialData ? 'Atualizar Nível' : 'Criar Nível'}
                    </button>
                </div>
            </form>
        </div>
    )
}
