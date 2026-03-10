'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth'
import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getBrazilDate } from '@/lib/kpi-engine'
import type { ActionResult } from '@/types'

const FunnelActivitySchema = z.object({
    prospections: z.number().min(0),
    visits: z.number().min(0),
    proposals: z.number().min(0)
})

export type FunnelActivityInput = z.infer<typeof FunnelActivitySchema>

/**
 * Registra ou atualiza o suor diário (PSV) do vendedor.
 */
export async function submitFunnelActivity(data: FunnelActivityInput): Promise<ActionResult<string>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const validated = FunnelActivitySchema.parse(data)
        const todayStr = getBrazilDate().toISOString().split('T')[0]

        // Buscar org_id do usuário
        const { data: user } = await supabase
            .from('users')
            .select('org_id')
            .eq('id', auth.userId)
            .single()

        if (!user) throw new Error('Usuário não encontrado')

        // Upsert: Se já existir registro hoje, atualiza. Senão, cria.
        const { error } = await supabase
            .from('funnel_activities')
            .upsert({
                user_id: auth.userId,
                org_id: user.org_id,
                date: todayStr,
                ...validated,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,date'
            })

        if (error) throw error

        revalidateTag('sales-funnel')
        revalidatePath('/dashboard')

        return { success: true, data: 'Suor diário registrado com sucesso! Bora pra cima. 🚀' }
    } catch (error: any) {
        console.error('Error in submitFunnelActivity:', error)
        return { success: false, error: error.message || 'Erro ao registrar atividades' }
    }
}
