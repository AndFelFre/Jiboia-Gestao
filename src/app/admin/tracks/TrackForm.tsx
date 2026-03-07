'use client'

import { useState, useEffect } from 'react'
import { createTrack, updateTrack } from '../actions/tracks'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import type { Track, TrackStage } from '@/types'

interface Organization {
    id: string
    name: string
}

interface TrackFormProps {
    organizations: Organization[]
    initialData?: Track
}

export default function TrackForm({ organizations, initialData }: TrackFormProps) {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedOrg, setSelectedOrg] = useState(initialData?.org_id || '')
    const [name, setName] = useState(initialData?.name || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [stages, setStages] = useState<TrackStage[]>(initialData?.stages || [])
    const router = useRouter()

    const addStage = () => {
        const keys = ['T', 'H', 'R', 'E', 'A', 'S', 'O', 'N']
        const nextKey = keys[stages.length] || String.fromCharCode(65 + stages.length)

        setStages([...stages, {
            key: nextKey,
            sequence: stages.length,
            name: '',
            description: '',
            requirements: []
        }])
    }

    const updateStage = (index: number, field: keyof TrackStage, value: any) => {
        const updated = [...stages]
        updated[index] = { ...updated[index], [field]: value }
        setStages(updated)
    }

    const removeStage = (index: number) => {
        setStages(stages.filter((_, i) => i !== index))
    }

    const moveStage = (index: number, direction: 'up' | 'down') => {
        const newStages = [...stages]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        if (targetIndex < 0 || targetIndex >= stages.length) return

        const [moved] = newStages.splice(index, 1)
        newStages.splice(targetIndex, 0, moved)

        // Atualiza sequências
        const finalized = newStages.map((s, i) => ({ ...s, sequence: i }))
        setStages(finalized)
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedOrg) {
            setError('Selecione uma organização')
            return
        }

        if (!name.trim()) {
            setError('Digite o nome da trilha')
            return
        }

        if (stages.length === 0) {
            setError('Adicione pelo menos uma etapa à trilha')
            return
        }

        setLoading(true)
        setError('')

        const trackData = {
            name,
            description,
            stages,
            org_id: selectedOrg,
        }

        const result = initialData
            ? await updateTrack(initialData.id, trackData)
            : await createTrack(trackData)

        if (result.success) {
            router.push('/admin/tracks')
            router.refresh()
        } else {
            setError(result.error || 'Erro ao salvar trilha')
            setLoading(false)
        }
    }

    return (
        <div className="bg-card rounded-lg shadow-sm border p-6">
            {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded">
                    <p className="text-destructive font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
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

                    <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Nome da Trilha *</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="Ex: Trilha de Liderança"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">Descrição</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="Descreva o objetivo desta trilha..."
                        />
                    </div>
                </div>

                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Etapas da Trilha</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Determine a progressão da carreira</p>
                        </div>
                        <button
                            type="button"
                            onClick={addStage}
                            className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Adicionar Etapa
                        </button>
                    </div>

                    {stages.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/30">
                            <p className="text-muted-foreground">Nenhuma etapa adicionada.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stages.map((stage, index) => (
                                <div key={index} className="bg-muted/30 p-5 rounded-lg border border-border/60 hover:border-primary/30 transition-colors relative group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
                                                {stage.key || index + 1}
                                            </div>
                                            <div className="ml-3">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Etapa {index + 1}</span>
                                                <h4 className="text-sm font-medium -mt-0.5">{stage.name || '(Sem nome)'}</h4>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => moveStage(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveStage(index, 'down')}
                                                disabled={index === stages.length - 1}
                                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeStage(index)}
                                                className="p-1 text-destructive hover:bg-destructive/10 rounded ml-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-1">
                                            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">ID/Key</label>
                                            <input
                                                type="text"
                                                value={stage.key}
                                                onChange={(e) => updateStage(index, 'key', e.target.value.toUpperCase())}
                                                className="w-full px-3 py-1.5 border border-input rounded text-sm bg-background"
                                                placeholder="Ex: T1"
                                                maxLength={10}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Nome</label>
                                            <input
                                                type="text"
                                                value={stage.name}
                                                onChange={(e) => updateStage(index, 'name', e.target.value)}
                                                className="w-full px-3 py-1.5 border border-input rounded text-sm bg-background"
                                                placeholder="Ex: Iniciante"
                                            />
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Descrição</label>
                                            <textarea
                                                value={stage.description}
                                                onChange={(e) => updateStage(index, 'description', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-1.5 border border-input rounded text-sm bg-background"
                                                placeholder="Requisitos para esta etapa..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Link
                        href="/admin/tracks"
                        className="px-4 py-2 border border-input rounded text-foreground hover:bg-muted font-medium transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 font-bold shadow-sm transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Salvando...' : initialData ? 'Atualizar Trilha' : 'Criar Trilha'}
                    </button>
                </div>
            </form>
        </div>
    )
}
