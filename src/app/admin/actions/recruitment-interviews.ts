'use server'
import { requirePermission } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/supabase/audit'

interface ActionResult<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

export interface Interview {
    id: string
    candidate_id: string
    interviewer_id: string
    type: string
    star_situation: string | null
    star_task: string | null
    star_action: string | null
    star_result: string | null
    fit_integrity: number | null
    fit_focus: number | null
    fit_learning: number | null
    fit_challenge: number | null
    fit_communication: number | null
    fit_service: number | null
    fit_persistence: number | null
    final_score: number | null
    justification: string
    recommendation: string | null
    next_steps: string | null
    conducted_at: string
}

export async function createInterview(formData: Partial<Interview>): Promise<ActionResult<Interview>> {
    try {
        const auth = await requirePermission('interviews.manage')
        const supabase = createServerSupabaseClient()

        // Calcular score final
        const scores = [
            formData.fit_integrity,
            formData.fit_focus,
            formData.fit_learning,
            formData.fit_challenge,
            formData.fit_communication,
            formData.fit_service,
            formData.fit_persistence,
        ].filter(s => s !== null && s !== undefined) as number[]

        const finalScore = scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : null

        const interviewData = {
            ...formData,
            interviewer_id: auth.userId,
            final_score: finalScore,
            conducted_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from('interviews')
            .insert(interviewData)
            .select()
            .single()

        if (error) {
            console.error('Erro ao criar entrevista:', error)
            return { success: false, error: 'Erro ao salvar avaliação' }
        }

        await logAudit({
            tableName: 'interviews',
            recordId: data.id,
            action: 'INSERT',
            newValues: interviewData,
        })

        revalidatePath(`/admin/recruitment/candidates/${formData.candidate_id}`)
        return { success: true, data: data as Interview }
    } catch (error: unknown) {
        console.error('Erro em createInterview:', getErrorMessage(error))
        return { success: false, error: 'Erro de permissão ou conexão' }
    }
}

