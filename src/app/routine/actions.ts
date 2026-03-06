'use server'

import { requireAuth, requirePermission } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// ==========================================
// SCHEMAS (ZOD)
// ==========================================

const routineDefinitionSchema = z.object({
    title: z.string().min(3, 'O título precisa de pelo menos 3 caracteres'),
    description: z.string().optional(),
    target_value: z.number().min(0, 'A meta não pode ser negativa'),
    frequency: z.enum(['daily', 'weekly', 'monthly'])
})

const routineInputSchema = z.object({
    routine_definition_id: z.string().uuid('ID de definição inválido'),
    achieved_value: z.number().min(0, 'O valor atingido não pode ser negativo'),
    notes: z.string().optional()
})

// ==========================================
// ACTIONS (ADMIN)
// ==========================================

export async function createRoutineDefinition(rawData: z.infer<typeof routineDefinitionSchema>) {
    try {
        const auth = await requirePermission('users.manage') // apenas admin gerencia
        const supabase = createServerSupabaseClient()

        // Validação estrita Zod
        const result = routineDefinitionSchema.safeParse(rawData)
        if (!result.success) {
            return { success: false, error: 'Erro de validação' }
        }

        const { data, error } = await supabase
            .from('routine_definitions')
            .insert({
                org_id: auth.orgId,
                title: result.data.title,
                description: result.data.description,
                target_value: result.data.target_value,
                frequency: result.data.frequency
            })
            .select()
            .single()

        if (error) throw error

        revalidatePath('/admin/routine')
        return { success: true, data }
    } catch (err: unknown) {
        const error = err as Error;
        return { success: false, error: error.message || 'Erro inesperado' }
    }
}

// ==========================================
// ACTIONS (COLLABORATOR)
// ==========================================

export async function saveRoutineInput(rawData: z.infer<typeof routineInputSchema>) {
    try {
        const auth = await requireAuth() // User precisa estar logado
        const supabase = createServerSupabaseClient()

        const result = routineInputSchema.safeParse(rawData)
        if (!result.success) {
            return { success: false, error: 'Erro de validação de formulário' }
        }

        // Calcula hoje (data local pra evitar timezone bug no UTC)
        // Para simplificação de input local:
        const today = new Date().toISOString().split('T')[0]

        // Upsert para garantir só 1 hit por dia/user/métrica
        const { data: existing } = await supabase
            .from('routine_inputs')
            .select('id')
            .eq('user_id', auth.userId)
            .eq('routine_definition_id', result.data.routine_definition_id)
            .eq('input_date', today)
            .single()

        let error;

        if (existing) {
            const updateRes = await supabase
                .from('routine_inputs')
                .update({
                    achieved_value: result.data.achieved_value,
                    notes: result.data.notes
                })
                .eq('id', existing.id)
            error = updateRes.error
        } else {
            const insertRes = await supabase
                .from('routine_inputs')
                .insert({
                    org_id: auth.orgId,
                    user_id: auth.userId,
                    routine_definition_id: result.data.routine_definition_id,
                    input_date: today,
                    achieved_value: result.data.achieved_value,
                    notes: result.data.notes
                })
            error = insertRes.error
        }

        if (error) throw error

        // Revalida a página filho pra bater na DB de novo
        revalidatePath('/routine/funnel')
        revalidatePath('/admin/routine')

        return { success: true }
    } catch (err: unknown) {
        const error = err as Error;
        return { success: false, error: error.message || 'Erro inesperado' }
    }
}

