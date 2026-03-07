'use client'

import React, { useState } from 'react'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface AdminDeleteButtonProps {
    itemId: string
    itemName: string
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>
    variant?: 'icon' | 'text' | 'outline'
    className?: string
    buttonText?: string
}

export function AdminDeleteButton({
    itemId,
    itemName,
    onDelete,
    variant = 'icon',
    className,
    buttonText = 'Excluir',
}: AdminDeleteButtonProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        setLoading(true)
        setError(null)

        try {
            const result = await onDelete(itemId)
            if (result.success) {
                setOpen(false)
            } else {
                setError(result.error || 'Não foi possível excluir este item.')
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado ao tentar excluir.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {variant === 'icon' ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors", className)}
                        title={`Excluir ${itemName}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        variant={variant === 'outline' ? 'outline' : 'ghost'}
                        className={cn(
                            variant === 'text' && "text-destructive hover:text-destructive/80 p-0 h-auto font-medium",
                            variant === 'outline' && "text-destructive border-destructive/20 hover:bg-destructive/10",
                            className
                        )}
                    >
                        {variant === 'outline' && <Trash2 className="mr-2 h-4 w-4" />}
                        {buttonText}
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] border-destructive/20 shadow-xl">
                <DialogHeader className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-foreground">Confirmar Exclusão</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Tem certeza que deseja excluir <span className="font-bold text-foreground">"{itemName}"</span>?
                        Esta ação pode ser irreversível se houver dependências.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive font-medium animate-in shake-1">
                        {error}
                    </div>
                )}

                <DialogFooter className="flex sm:justify-center gap-3 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 font-bold shadow-lg shadow-destructive/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Excluindo...
                            </>
                        ) : (
                            'Sim, Excluir'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
