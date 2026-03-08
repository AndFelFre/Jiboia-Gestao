'use client'

import { useState } from 'react'
import { createJob } from '@/services/recruitment/jobs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Loader2 } from 'lucide-react'

interface Organization {
    id: string
    name: string
}

interface Unit {
    id: string
    name: string
    org_id: string
}

interface Position {
    id: string
    title: string
    org_id: string
}

interface JobFormProps {
    organizations: Organization[]
    units: Unit[]
    positions: Position[]
}

export default function JobFormAdmin({ organizations, units, positions }: JobFormProps) {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedOrg, setSelectedOrg] = useState('')
    const router = useRouter()

    const filteredUnits = selectedOrg
        ? units.filter(u => u.org_id === selectedOrg)
        : []

    const filteredPositions = selectedOrg
        ? positions.filter(p => p.org_id === selectedOrg)
        : []

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)

        const result = await createJob({
            org_id: selectedOrg,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            unit_id: formData.get('unit_id') as string || null,
            position_id: formData.get('position_id') as string || null,
            location: formData.get('location') as string,
            employment_type: formData.get('employment_type') as string,
            salary_min: formData.get('salary_min') ? parseFloat(formData.get('salary_min') as string) : null,
            salary_max: formData.get('salary_max') ? parseFloat(formData.get('salary_max') as string) : null,
            positions_count: parseInt(formData.get('positions_count') as string) || 1,
            priority: (formData.get('priority') as 'low' | 'normal' | 'high' | 'urgent') || 'normal',
            sla_days: parseInt(formData.get('sla_days') as string) || 30,
            status: 'open',
        })

        if (result.success) {
            router.push('/admin/recruitment/jobs')
            router.refresh()
        } else {
            setError(result.error || 'Erro ao criar vaga')
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <Button asChild variant="ghost" size="icon">
                            <Link href="/admin/recruitment/jobs">
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <CardTitle className="text-2xl">Nova Vaga</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground ml-12">Preencha os detalhes da nova oportunidade de trabalho.</p>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive font-medium">
                            {error}
                        </div>
                    )}

                    <form id="job-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Organização *</label>
                                <select
                                    value={selectedOrg}
                                    onChange={(e) => setSelectedOrg(e.target.value)}
                                    className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {organizations.map((org) => (
                                        <option key={org.id} value={org.id}>{org.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Título da Vaga *</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                                    placeholder="Ex: Desenvolvedor Full Stack"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Cargo Associado</label>
                                <select
                                    name="position_id"
                                    disabled={!selectedOrg}
                                    className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20 disabled:opacity-50"
                                >
                                    <option value="">Selecione...</option>
                                    {filteredPositions.map((pos) => (
                                        <option key={pos.id} value={pos.id}>{pos.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Unidade de Alocação</label>
                                <select
                                    name="unit_id"
                                    disabled={!selectedOrg}
                                    className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20 disabled:opacity-50"
                                >
                                    <option value="">Matriz</option>
                                    {filteredUnits.map((unit) => (
                                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Descrição e Requisitos</label>
                            <textarea
                                name="description"
                                rows={4}
                                className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                                placeholder="Detalhes da vaga..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Localização</label>
                                <input
                                    type="text"
                                    name="location"
                                    className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                                    placeholder="Ex: Remoto / SP"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Tipo de Contrato</label>
                                <select
                                    name="employment_type"
                                    className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                                >
                                    <option value="clt">CLT</option>
                                    <option value="pj">PJ</option>
                                    <option value="intern">Estágio</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Número de Vagas</label>
                                <input
                                    type="number"
                                    name="positions_count"
                                    min="1"
                                    defaultValue="1"
                                    className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Prioridade</label>
                                <select
                                    name="priority"
                                    className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                                >
                                    <option value="low">Baixa</option>
                                    <option value="normal" selected>Normal</option>
                                    <option value="high">Alta</option>
                                    <option value="urgent">Urgente</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">SLA (Dias para Fechar)</label>
                                <input
                                    type="number"
                                    name="sla_days"
                                    min="1"
                                    defaultValue="30"
                                    className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                                />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 bg-muted/20 border-t p-6">
                    <Button asChild variant="ghost">
                        <Link href="/admin/recruitment/jobs">Cancelar</Link>
                    </Button>
                    <Button type="submit" form="job-form" disabled={loading} className="px-8">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Salvando...' : 'Publicar Vaga'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
