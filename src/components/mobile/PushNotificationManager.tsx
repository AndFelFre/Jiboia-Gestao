'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { savePushSubscription, deletePushSubscription } from '@/app/actions/push-notifications'
import { Badge } from '@/components/ui/badge'

export function PushNotificationManager() {
    const [status, setStatus] = useState<'default' | 'granted' | 'denied'>('default')
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [isSupported, setIsSupported] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
            setIsSupported(true)
            setStatus(Notification.permission as any)
        }
    }, [])

    async function subscribe() {
        setIsActionLoading(true)
        try {
            const permission = await Notification.requestPermission()
            setStatus(permission as any)

            if (permission === 'granted') {
                const registration = await navigator.serviceWorker.ready
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
                        ? urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
                        : undefined // Em desenvolvimento sem VAPID KEY real
                })

                await savePushSubscription({ subscription: subscription.toJSON(), deviceName: navigator.userAgent })
            }
        } catch (error) {
            console.error('Erro ao assinar notificações:', error)
        }
        setIsActionLoading(false)
    }

    async function unsubscribe() {
        setIsActionLoading(true)
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            if (subscription) {
                await deletePushSubscription({ subscriptionJson: subscription.toJSON() })
                await subscription.unsubscribe()
            }
            setStatus('default')
        } catch (error) {
            console.error('Erro ao cancelar assinatura:', error)
        }
        setIsActionLoading(false)
    }

    if (!isSupported) return null

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Bell className="w-16 h-16 text-primary" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Notificações Inteligentes</h3>
                        {status === 'granted' && (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none rounded-full px-3">
                                Ativado
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 max-w-md">
                        Receba lembretes de PDI, novas medalhas e tarefas de onboarding diretamente no seu dispositivo.
                    </p>
                </div>

                <div className="flex shrink-0">
                    {status === 'granted' ? (
                        <Button
                            variant="outline"
                            onClick={unsubscribe}
                            disabled={isActionLoading}
                            className="rounded-2xl border-slate-100 dark:border-slate-800 hover:bg-slate-50 h-14 px-8 font-bold text-slate-600"
                        >
                            {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <div className="flex items-center gap-2">
                                    <BellOff className="w-5 h-5" />
                                    Desativar Alertas
                                </div>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={subscribe}
                            disabled={isActionLoading || status === 'denied'}
                            className="rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 h-14 px-8 font-bold"
                        >
                            {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <div className="flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    {status === 'denied' ? 'Bloqueado no Navegador' : 'Ativar Notificações'}
                                </div>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
