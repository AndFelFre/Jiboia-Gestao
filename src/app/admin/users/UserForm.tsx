import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema, type UserInput } from '@/validations/schemas'
import { inviteUser } from '../actions/users'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from '@/components/ui/feedback'
import Link from 'next/link'


interface Organization {
    id: string
    name: string
}

interface Unit {
    id: string
    name: string
    org_id: string
}

interface Role {
    id: string
    name: string
}

interface Position {
    id: string
    title: string
    org_id: string
}

interface UserFormProps {
    organizations: Organization[]
    units: Unit[]
    roles: Role[]
    positions: Position[]
}

export default function UserForm({ organizations, units, roles, positions }: UserFormProps) {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedOrg, setSelectedOrg] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()

    // Validação de Contexto via URL
    useEffect(() => {
        const orgIdParam = searchParams.get('orgId')
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

        if (orgIdParam && uuidRegex.test(orgIdParam)) {
            setSelectedOrg(orgIdParam)
        }
    }, [searchParams])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UserInput>({
        resolver: zodResolver(userSchema),
    })

    const isContextLocked = searchParams.has('orgId')

    // Filtros baseados na organização selecionada
    const filteredUnits = selectedOrg
        ? units.filter(u => u.org_id === selectedOrg)
        : []

    const filteredPositions = selectedOrg
        ? positions.filter(p => p.org_id === selectedOrg)
        : []


    const onSubmit = async (data: UserInput) => {
        if (!selectedOrg) {
            toast.error('Selecione uma organização')
            setError('Selecione uma organização')
            return
        }

        setLoading(true)
        setError('')

        try {
            const result = await inviteUser({
                ...data,
                org_id: selectedOrg,
            })

            if (result.success) {
                toast.success('Usuário convidado com sucesso!')
                setTimeout(() => {
                    router.push('/admin/users')
                    router.refresh()
                }, 1500)
            } else {
                toast.error(result.error || 'Erro ao convidar usuário')
                setError(result.error || 'Erro ao convidar usuário')
                setLoading(false)
            }
        } catch (err) {
            toast.error('Erro inesperado ao convidar usuário')
            setError('Erro inesperado ao convidar usuário')
            setLoading(false)
        }
    }

    return (
        <div className="bg-card rounded-lg shadow-sm border p-6">
            {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded animate-in fade-in duration-300">
                    <p className="text-destructive font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!isContextLocked && (
                        <div className="md:col-span-2">
                            <label htmlFor="org_id" className="block text-sm font-medium text-foreground">Organização *</label>
                            <select
                                id="org_id"
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            >
                                <option value="">Selecione uma organização...</option>
                                {organizations.map((org) => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-foreground">Nome Completo *</label>

                        <input
                            {...register('full_name')}
                            type="text"
                            id="full_name"
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="Ex: João Silva"
                        />
                        {errors.full_name && (
                            <p className="mt-1 text-sm text-destructive">{errors.full_name.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground">E-mail *</label>
                        <input
                            {...register('email')}
                            type="email"
                            id="email"
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="joao@empresa.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="role_id" className="block text-sm font-medium text-foreground">Papel (Permissões) *</label>
                        <select
                            {...register('role_id')}
                            id="role_id"
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        >
                            <option value="">Selecione um papel...</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                        {errors.role_id && (
                            <p className="mt-1 text-sm text-destructive">{errors.role_id.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="unit_id" className="block text-sm font-medium text-foreground">Unidade *</label>
                        <select
                            {...register('unit_id')}
                            id="unit_id"
                            disabled={!selectedOrg}
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-muted"
                        >
                            <option value="">Selecione uma unidade...</option>
                            {filteredUnits.map((unit) => (
                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                            ))}
                        </select>
                        {errors.unit_id && (
                            <p className="mt-1 text-sm text-destructive">{errors.unit_id.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="position_id" className="block text-sm font-medium text-foreground">Cargo (Opcional)</label>
                        <select
                            {...register('position_id')}
                            id="position_id"
                            disabled={!selectedOrg}
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-muted"
                        >
                            <option value="">Selecione um cargo...</option>
                            {filteredPositions.map((pos) => (
                                <option key={pos.id} value={pos.id}>{pos.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <Link
                        href={isContextLocked ? `/admin/organizations/${selectedOrg}?tab=team` : '/admin/users'}
                        className="px-4 py-2 border border-input rounded text-foreground hover:bg-muted"
                    >
                        Cancelar
                    </Link>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 font-medium"
                    >
                        {loading ? 'Convidando...' : 'Enviar Convite'}
                    </button>
                </div>
            </form>
        </div>
    )
}
