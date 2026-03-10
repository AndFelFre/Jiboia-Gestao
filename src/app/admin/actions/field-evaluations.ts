'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth'
import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionResult } from '@/types'

const FieldEvaluationSchema = z.object({
    agent_id: z.string().uuid(),
    score_planning: z.number().min(1).max(4),
    score_connection: z.number().min(1).max(4),
    score_diagnostic: z.number().min(1).max(4),

    // Notas Condicionais
    score_negotiation: z.number().min(1).max(4).nullable(),
    score_closing: z.number().min(1).max(4).nullable(),
    score_retention: z.number().min(1).max(4).nullable(),

    // Textos
    strengths: z.string().min(10, "Descreva os pontos fortes com mais detalhes"),
    improvements: z.string().min(10, "Descreva os pontos de melhoria com mais detalhes"),
    next_challenge: z.string().min(1, "Defina o próximo desafio"),
    feedback_checkpoint: z.string().min(1, "Defina o checkpoint de feedback")
})

export type FieldEvaluationInput = z.infer<typeof FieldEvaluationSchema>

/**
 * Submete uma nova avaliação de rito de campo (RUA)
 */
export async function submitFieldEvaluation(data: FieldEvaluationInput): Promise<ActionResult<string>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        // Validar dados
        const validated = FieldEvaluationSchema.parse(data)

        // Inserir no banco
        // org_id será injetado pela RLS ou buscado aqui para garantir integridade
        const { data: userData } = await supabase
            .from('users')
            .select('org_id')
            .eq('id', auth.userId)
            .single()

        if (!userData) throw new Error('Organização não encontrada para o avaliador')

        const { error } = await supabase
            .from('field_evaluations')
            .insert({
                ...validated,
                evaluator_id: auth.userId,
                org_id: userData.org_id
            })

        if (error) throw error

        // Revalidar caches relacionados a performance e dashboard
        revalidateTag('performance')
        revalidatePath('/admin/performance')

        return { success: true, data: 'Avaliação registrada com sucesso!' }
    } catch (error: any) {
        console.error('Error submitting field evaluation:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        return { success: false, error: error.message || 'Erro ao registrar avaliação' }
    }
}
