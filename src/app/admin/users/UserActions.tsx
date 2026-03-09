'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { resendInvite, updateUserStatus } from '../actions/users'
import { toast } from '@/components/ui/feedback'
import { cn } from '@/lib/utils'

interface UserActionsProps {
    userId: string
    status: 'active' | 'inactive' | 'pending'
}

export function UserActions({ userId, status }: UserActionsProps) {
    const [loading, setLoading] = useState(false)
    const [currentStatus, setCurrentStatus] = useState(status)

    const handleResend = async () => {
        setLoading(true)
        try {
            const result = await resendInvite(userId)
            if (result.success) {
                toast.success('Convite reenviado com sucesso!')
            } else {
                toast.error(result.error || 'Erro ao reenviar convite')
            }
        } catch (error) {
            toast.error('Erro inesperado ao reenviar convite')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async () => {
        setLoading(true)
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
        try {
            const result = await updateUserStatus(userId, newStatus)
            if (result.success) {
                setCurrentStatus(newStatus as any)
                toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`)
            } else {
                toast.error(result.error || 'Erro ao atualizar status')
            }
        } catch (error) {
            toast.error('Erro inesperado ao atualizar status')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-end gap-2">
            {currentStatus === 'pending' && (
                <Button
                    onClick={handleResend}
                    disabled={loading}
                    variant="ghost"
                    size="sm"
                    title="Reenviar Convite"
                    className="h-9 w-9 p-0 rounded-xl text-indigo-600 hover:bg-indigo-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
            )}

            <Button
                onClick={handleToggleStatus}
                disabled={loading}
                variant="ghost"
                size="sm"
                className={cn(
                    "h-9 px-4 rounded-xl font-bold transition-all",
                    currentStatus === 'active'
                        ? "text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                        : "text-green-600 hover:bg-green-50"
                )}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : currentStatus === 'active' ? (
                    <ToggleLeft className="w-4 h-4 mr-2 opacity-50" />
                ) : (
                    <ToggleRight className="w-4 h-4 mr-2" />
                )}
                {currentStatus === 'active' ? 'Desativar' : 'Ativar'}
            </Button>
        </div>
    )
}
