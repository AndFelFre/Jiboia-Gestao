'use client'

import { useEffect, useRef, useCallback } from 'react'

declare global {
    interface Window {
        turnstile: {
            render: (element: HTMLElement, options: Record<string, unknown>) => string
            reset: (widgetId: string) => void
            remove: (widgetId: string) => void
        }
        onTurnstileLoad?: () => void
    }
}

interface TurnstileWidgetProps {
    onVerify: (token: string) => void
    onExpire?: () => void
    onError?: () => void
}

/**
 * Cloudflare Turnstile — Captcha invisível que bloqueia robôs.
 * Renderiza um desafio invisível e retorna um token JWT para validação server-side.
 * 
 * Requer: NEXT_PUBLIC_TURNSTILE_SITE_KEY no .env.local
 */
export function TurnstileWidget({ onVerify, onExpire, onError }: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA' // Test key (always passes)

    const renderWidget = useCallback(() => {
        if (!containerRef.current || !window.turnstile) return

        // Limpar widget anterior
        if (widgetIdRef.current) {
            try { window.turnstile.remove(widgetIdRef.current) } catch { }
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            'expired-callback': onExpire,
            'error-callback': onError,
            theme: 'auto',
            appearance: 'interaction-only', // Invisível, aparece só quando necessário
        })
    }, [siteKey, onVerify, onExpire, onError])

    useEffect(() => {
        // Se o script já carregou, renderizar direto
        if (window.turnstile) {
            renderWidget()
            return
        }

        // Carregar o script do Turnstile
        window.onTurnstileLoad = renderWidget

        const script = document.createElement('script')
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
        script.async = true
        script.defer = true
        document.head.appendChild(script)

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                try { window.turnstile.remove(widgetIdRef.current) } catch { }
            }
        }
    }, [renderWidget])

    return <div ref={containerRef} className="mt-2" />
}
