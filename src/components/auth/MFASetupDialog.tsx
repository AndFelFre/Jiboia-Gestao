'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getMFASetup, verifyAndEnableMFA } from '@/app/actions/security_actions'
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MFASetupDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function MFASetupDialog({ open, onOpenChange, onSuccess }: MFASetupDialogProps) {
    const [step, setStep] = useState<'initial' | 'setup' | 'verifying'>('initial')
    const [setupData, setSetupData] = useState<{ id: string; totp: { secret: string; qr_code: string } } | null>(null)
    const [verificationCode, setVerificationCode] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleStartSetup = async () => {
        setLoading(true)
        setError(null)
        const res = await getMFASetup()
        if (res.success && res.data) {
            setSetupData(res.data as any)
            setStep('setup')
        } else {
            setError(res.error || 'Erro ao iniciar configuração.')
        }
        setLoading(false)
    }

    const handleVerify = async () => {
        if (verificationCode.length !== 6) return
        setLoading(true)
        setError(null)
        const res = await verifyAndEnableMFA(verificationCode, setupData!.id)
        if (res.success) {
            onSuccess()
            onOpenChange(false)
            setStep('initial')
            setSetupData(null)
            setVerificationCode('')
        } else {
            setError(res.error || 'Código inválido.')
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        Configurar Autenticação em Duas Etapas
                    </DialogTitle>
                    <DialogDescription>
                        Adicione uma camada extra de segurança à sua conta usando um aplicativo autenticador.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {step === 'initial' && (
                    <div className="py-6 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Você precisará de um aplicativo como Google Authenticator ou Authy instalado no seu celular.
                        </p>
                        <Button onClick={handleStartSetup} disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Começar Configuração
                        </Button>
                    </div>
                )}

                {step === 'setup' && setupData && (
                    <div className="py-4 space-y-6">
                        <div className="flex flex-col items-center space-y-4">
                            <p className="text-sm font-medium text-center">
                                Escaneie o QR Code abaixo com seu aplicativo autenticador:
                            </p>
                            <div
                                className="p-2 bg-white rounded-lg border shadow-sm"
                                dangerouslySetInnerHTML={{ __html: setupData.totp.qr_code }}
                            />
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">Ou insira manualmente o código:</p>
                                <code className="text-xs font-mono bg-muted px-2 py-1 rounded select-all">
                                    {setupData.totp.secret}
                                </code>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Digite o código de 6 dígitos gerado:</label>
                                <Input
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="text-center text-lg tracking-[0.5em] font-mono"
                                />
                            </div>
                            <Button
                                onClick={handleVerify}
                                disabled={loading || verificationCode.length !== 6}
                                className="w-full"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verificar e Ativar
                            </Button>
                            <Button variant="ghost" className="w-full text-xs" onClick={() => setStep('initial')}>
                                Voltar
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
