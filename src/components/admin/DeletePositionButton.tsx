'use client'

import { deletePosition } from '@/app/admin/actions/positions'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DeletePositionButtonProps {
    positionId: string
    positionTitle: string
}

export function DeletePositionButton({ positionId, positionTitle }: DeletePositionButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir o cargo "${positionTitle}"?`)) {
            return
        }

        setIsDeleting(true)
        try {
            const result = await deletePosition(positionId)
            if (!result.success) {
                alert(result.error || 'Erro ao excluir cargo')
            }
        } catch (error) {
            console.error('Erro ao excluir cargo:', error)
            alert('Ocorreu um erro inesperado')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50"
            title="Excluir Cargo"
        >
            <span className="text-xs">{isDeleting ? 'Excluindo...' : 'Excluir'}</span>
        </button>
    )
}
