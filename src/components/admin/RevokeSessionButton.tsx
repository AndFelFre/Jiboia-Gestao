'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, RefreshCw } from 'lucide-react'
import { revokeSession } from '@/app/admin/actions/sessions'

interface RevokeSessionButtonProps {
    sessionId: string
}

export function RevokeSessionButton({ sessionId }: RevokeSessionButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleRevoke = async () => {
        if (!confirm('Tem certeza que deseja encerrar esta sessão? O usuário será deslogado imediatamente.')) return

        setError(null)
        startTransition(async () => {
            const result = await revokeSession(sessionId)
            if (!result.success) {
                setError(result.error || 'Erro ao revogar')
            }
        })
    }

    return (
        <div className="space-y-2">
            <Button
                onClick={handleRevoke}
                disabled={isPending}
                variant="ghost"
                className={`w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest gap-2 transition-all ${isPending ? 'bg-slate-50 text-slate-400' : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                    }`}
            >
                {isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                    <LogOut className="w-4 h-4" />
                )}
                {isPending ? 'Encerrando...' : 'Encerrar Acesso'}
            </Button>
            {error && <p className="text-[10px] text-rose-500 font-bold text-center uppercase">{error}</p>}
        </div>
    )
}
