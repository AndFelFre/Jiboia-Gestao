'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createSafeAction } from '@/lib/supabase/safe-action'
import { pushSubscriptionSchema, deletePushSchema } from '@/validations/notifications'

/**
 * Salva uma nova assinatura de Notificação Push
 */
export const savePushSubscription = createSafeAction(pushSubscriptionSchema, async (data, auth) => {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase
        .from('user_push_subscriptions')
        .upsert({
            user_id: auth.userId,
            org_id: auth.orgId,
            subscription_json: data.subscription,
            device_name: data.deviceName || 'Navegador Web',
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, subscription_json'
        })

    if (error) throw error

    return { success: true }
})

/**
 * Remove uma assinatura de Notificação Push
 */
export const deletePushSubscription = createSafeAction(deletePushSchema, async (data, auth) => {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase
        .from('user_push_subscriptions')
        .delete()
        .eq('user_id', auth.userId)
        .eq('subscription_json', data.subscriptionJson)

    if (error) throw error

    return { success: true }
})
