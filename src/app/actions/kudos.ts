'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { dispatchWebhook } from '@/lib/integrations/webhooks'
import { createSafeAction } from '@/lib/supabase/safe-action'
import { sendKudoSchema, getKudosSchema, deleteKudoSchema } from '@/validations/kudos'

export interface Kudo {
    id: string
    sender_id: string
    receiver_id: string
    org_id: string
    message: string
    tags?: string[]
    created_at: string
    sender?: { full_name: string }
    receiver?: { full_name: string }
}

/**
 * Envia um Kudo (elogio) para um colega
 */
export const sendKudo = createSafeAction(sendKudoSchema, async (data, auth) => {
    const { receiverId, message, tags } = data
    const supabase = createServerSupabaseClient()

    if (auth.userId === receiverId) {
        throw new Error("Você não pode enviar um kudo para si mesmo.")
    }

    const { error } = await supabase
        .from('kudos')
        .insert({
            sender_id: auth.userId,
            receiver_id: receiverId,
            org_id: auth.orgId,
            message,
            tags
        })

    if (error) throw error

    // Disparar Webhook (Background)
    dispatchWebhook(auth.orgId, 'kudo.created', {
        sender_id: auth.userId,
        receiver_id: receiverId,
        message,
        tags
    }).catch(console.error)

    revalidatePath('/dashboard')
    return { success: true }
})

/**
 * Recupera o Feed de Kudos da organização
 */
export const getKudosFeed = createSafeAction(getKudosSchema, async (data, auth) => {
    const { limit } = data
    const supabase = createServerSupabaseClient()

    const { data: kudos, error } = await supabase
        .from('kudos')
        .select(`
            *,
            sender:users!sender_id ( full_name ),
            receiver:users!receiver_id ( full_name )
        `)
        .eq('org_id', auth.orgId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw error

    return kudos as Kudo[]
})

/**
 * Remove um Kudo (apenas o remetente)
 */
export const deleteKudo = createSafeAction(deleteKudoSchema, async (data, auth) => {
    const { kudoId } = data
    const supabase = createServerSupabaseClient()

    const { error } = await supabase
        .from('kudos')
        .delete()
        .eq('id', kudoId)
        .eq('sender_id', auth.userId)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
})
