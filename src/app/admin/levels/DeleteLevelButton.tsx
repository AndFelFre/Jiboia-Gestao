'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteLevel } from '../actions/levels'
import { useRouter } from 'next/navigation'

interface DeleteLevelButtonProps {
    id: string
    name: string
}

export function DeleteLevelButton({ id, name }: DeleteLevelButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir o nível "${name}"? Esta ação não pode ser desfeita.`)) {
            return
        }

        setLoading(true)
        try {
            const result = await deleteLevel(id)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error || 'Erro ao excluir nível.')
            }
        } catch (error) {
            alert('Erro inesperado ao excluir nível.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={loading}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Excluir Nível"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </Button>
    )
}
