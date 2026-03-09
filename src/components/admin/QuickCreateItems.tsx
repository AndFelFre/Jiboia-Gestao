"use client";

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createUnit } from '@/app/admin/actions/units'
import { createPosition } from '@/app/admin/actions/positions'
import { toast } from '@/components/ui/feedback'

interface QuickCreateUnitProps {
    orgId: string;
    onSuccess: (unit: { id: string, name: string }) => void;
}

export function QuickCreateUnit({ orgId, onSuccess }: QuickCreateUnitProps) {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        if (!name.trim()) return;
        setLoading(true)
        try {
            const result = await createUnit({ name: name.trim(), org_id: orgId })
            if (result.success && result.data) {
                toast.success('Unidade criada!')
                onSuccess(result.data as { id: string, name: string })
            } else {
                toast.error(result.error || 'Erro ao criar unidade')
            }
        } catch (error) {
            toast.error('Erro de rede ao criar unidade')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4 py-2">
            <div className="space-y-2">
                <Label htmlFor="quick-unit-name">Nome da Unidade *</Label>
                <Input
                    id="quick-unit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Departamento de TI"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
            </div>
            <Button
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                className="w-full rounded-xl font-bold"
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Criar Unidade
            </Button>
        </div>
    )
}

interface QuickCreatePositionProps {
    orgId: string;
    onSuccess: (position: { id: string, title: string }) => void;
}

export function QuickCreatePosition({ orgId, onSuccess }: QuickCreatePositionProps) {
    const [title, setTitle] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        if (!title.trim()) return;
        setLoading(true)
        try {
            const result = await createPosition({
                title: title.trim(),
                org_id: orgId,
                description: '',
                track_id: '',
                level_id: ''
            })
            if (result.success && result.data) {
                toast.success('Cargo criado!')
                onSuccess(result.data as { id: string, title: string })
            } else {
                toast.error(result.error || 'Erro ao criar cargo')
            }
        } catch (error) {
            toast.error('Erro de rede ao criar cargo')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4 py-2">
            <div className="space-y-2">
                <Label htmlFor="quick-pos-title">Título do Cargo *</Label>
                <Input
                    id="quick-pos-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Desenvolvedor Senior"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
            </div>
            <Button
                onClick={handleCreate}
                disabled={loading || !title.trim()}
                className="w-full rounded-xl font-bold"
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Criar Cargo
            </Button>
        </div>
    )
}
