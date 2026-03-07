import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Dispara webhooks para um determinado evento e organização
 */
export async function dispatchWebhook(orgId: string, eventType: string, payload: any) {
    try {
        const supabase = createServerSupabaseClient()

        // 1. Buscar webhooks ativos para este evento na organização
        const { data: hooks, error } = await supabase
            .from('webhooks')
            .select('*')
            .eq('org_id', orgId)
            .eq('event_type', eventType)
            .eq('is_active', true)

        if (error) {
            console.error('Erro ao buscar webhooks:', error)
            return
        }

        if (!hooks || hooks.length === 0) return

        // 2. Disparar cada webhook de forma assíncrona (não bloqueante)
        const deliveries = hooks.map(async (hook) => {
            const body = JSON.stringify({
                event: eventType,
                timestamp: new Date().toISOString(),
                data: payload
            })

            let signature = ''
            if (hook.secret) {
                try {
                    const crypto = await import('crypto')
                    signature = crypto
                        .createHmac('sha256', hook.secret)
                        .update(body)
                        .digest('hex')
                } catch (cryptoErr) {
                    console.error('Erro ao gerar assinatura HMAC:', cryptoErr)
                }
            }

            return fetch(hook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-RG-Event': eventType,
                    'X-RG-Signature': signature
                },
                body
            }).catch(err => {
                console.error(`Falha ao disparar webhook ${hook.name}:`, err)
            })
        })

        // Não aguardamos o término para não travar a resposta principal do servidor
        // mas logamos se necessário no background service
        Promise.all(deliveries)

    } catch (error) {
        console.error('Erro geral no dispatch de webhook:', error)
    }
}
