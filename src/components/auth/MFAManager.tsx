'use client'

import { useState, useEffect } from 'react'
import { getActiveMFAFactors, unenrollMFA } from '@/app/actions/security_actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, ShieldAlert, Loader2, Trash2, Plus } from 'lucide-react'
import { MFASetupDialog } from './MFASetupDialog'
import { Badge } from '@/components/ui/badge'

export function MFAManager() {
    const [factors, setFactors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [setupOpen, setSetupOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const loadFactors = async () => {
        setLoading(true)
        const res = await getActiveMFAFactors()
        if (res.success) {
            setFactors(res.data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        loadFactors()
    }, [])

    const handleUnenroll = async (factorId: string) => {
        if (!confirm('Tem certeza que deseja remover este fator de segurança? Sua conta ficará menos protegida.')) return
        setActionLoading(factorId)
        const res = await unenrollMFA(factorId)
        if (res.success) {
            loadFactors()
        }
        setActionLoading(null)
    }

    const isEnabled = factors.length > 0

    return (
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <ShieldCheck className={`w-5 h-5 ${isEnabled ? 'text-green-500' : 'text-slate-400'}`} />
                        Segurança da Conta
                    </CardTitle>
                    <Badge variant={isEnabled ? 'default' : 'secondary'} className={isEnabled ? 'bg-green-500' : ''}>
                        {isEnabled ? 'Protegida' : 'Proteção Básica'}
                    </Badge>
                </div>
                <CardDescription>
                    Gerencie a autenticação em duas etapas para proteger seu acesso.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {factors.length === 0 ? (
                            <div className="flex flex-col items-center text-center p-6 border-2 border-dashed rounded-3xl space-y-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                                    <ShieldAlert className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">MFA Desativada</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Ative a autenticação em duas etapas para garantir que apenas você acesse sua conta.
                                    </p>
                                </div>
                                <Button onClick={() => setSetupOpen(true)} size="sm" className="rounded-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Configurar agora
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {factors.map((factor) => (
                                    <div key={factor.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border shadow-sm">
                                                <ShieldCheck className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">Aplicativo Autenticador</p>
                                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                                    Ativo desde {new Date(factor.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-destructive transition-colors shrink-0"
                                            onClick={() => handleUnenroll(factor.id)}
                                            disabled={!!actionLoading}
                                        >
                                            {actionLoading === factor.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <MFASetupDialog
                    open={setupOpen}
                    onOpenChange={setSetupOpen}
                    onSuccess={loadFactors}
                />
            </CardContent>
        </Card>
    )
}
