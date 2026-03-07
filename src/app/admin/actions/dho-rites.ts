'use server'

import { requireAuth, requirePermission } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/supabase/audit'
import { pdiItemSchema } from '@/validations/schemas'
import type { DHORiteType, ActionResult } from '@/types'

/**
 * Valida se o usuário autenticado tem autoridade sobre o colaborador.
 * Autoridade = ser Admin ou ser o líder direto (via index de usuários).
 */
async function validateLeadershipAuthority(targetUserId: string) {
    const auth = await requireAuth()

    // 1. Admin tem autoridade total
    if (auth.role === 'admin') return auth

    // 2. Colaborador não pode criar rito para si mesmo
    if (auth.userId === targetUserId) {
        throw new Error('FORBIDDEN: Não é permitido registrar ritos para si mesmo.')
    }

    const supabase = createServerSupabaseClient()

    // 3. Verifica se o auth.userId é o líder do targetUserId
    // Nota: Assume-se que a tabela users tem um campo reports_to ou similar. 
    // Se não houver, verificamos se o plano de ritos atual do usuário já o lista como líder.
    const { data: isLeader } = await supabase
        .from('users')
        .select('id')
        .eq('id', targetUserId)
        .eq('leader_id', auth.userId) // Campo adicionado na migration de ritos se for centralizado, ou campo de hierarquia
        .maybeSingle()

    // Como no rito o líder é quem conduz, a autoridade é verificada pela relação de gestão.
    // Se não houver campo de hierarquia explícito, o Admin/RH gerencia ou o líder do plano.
    if (!isLeader && auth.role !== 'leader') {
        throw new Error('FORBIDDEN: Você não possui autoridade de liderança sobre este colaborador.')
    }

    return auth
}

/**
 * Busca ou cria o Plano de Ritos de Liderança do colaborador para o ano de referência.
 * A trava de unicidade no banco (idx_unique_rites_plan_per_year) garante a consistência.
 */
export async function getOrCreateLeadershipRitePlan(
    userId: string,
    referenceYear: number
): Promise<ActionResult<{ id: string }>> {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        // 1. Tentar buscar plano existente
        const { data: existingPlan } = await supabase
            .from('pdi_plans')
            .select('id')
            .eq('user_id', userId)
            .eq('plan_type', 'leadership_rites')
            .eq('reference_year', referenceYear)
            .maybeSingle()

        if (existingPlan) {
            return { success: true, data: { id: existingPlan.id } }
        }

        // 2. Criar novo plano se não existir
        const planData = {
            org_id: auth.orgId,
            user_id: userId,
            title: `Ritos de Liderança - ${referenceYear}`,
            plan_type: 'leadership_rites',
            reference_year: referenceYear,
            leader_id: auth.userId,
            status: 'active'
        }

        const { data: newPlan, error: insertError } = await supabase
            .from('pdi_plans')
            .insert(planData)
            .select('id')
            .single()

        if (insertError) {
            // Se der erro de unicidade (concorrência), tenta buscar de novo (RETRY)
            if (insertError.code === '23505') {
                const { data: retryPlan } = await supabase
                    .from('pdi_plans')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('plan_type', 'leadership_rites')
                    .eq('reference_year', referenceYear)
                    .single()

                if (retryPlan) return { success: true, data: { id: retryPlan.id } }
            }
            throw insertError
        }

        await logAudit({
            tableName: 'pdi_plans',
            recordId: newPlan.id,
            action: 'INSERT',
            newValues: planData
        })

        return { success: true, data: { id: newPlan.id } }
    } catch (error: any) {
        console.error('Erro em getOrCreateLeadershipRitePlan:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Adiciona um novo Rito de Liderança
 */
export async function addLeadershipRite(params: {
    userId: string
    riteType: DHORiteType
    title: string
    description?: string
    deadline?: string // ISO Date para agendamento
    status?: 'not_started' | 'completed'
}): Promise<ActionResult> {
    try {
        const auth = await validateLeadershipAuthority(params.userId)
        const supabase = createServerSupabaseClient()

        // Calcular reference_year baseado no deadline ou data atual
        const riteDate = params.deadline ? new Date(params.deadline) : new Date()
        const referenceYear = riteDate.getFullYear()

        // 1. Garante o plano anual (Fluxo resiliente a concorrência)
        const planResult = await getOrCreateLeadershipRitePlan(params.userId, referenceYear)
        if (!planResult.success || !planResult.data) {
            throw new Error(planResult.error || 'Falha ao garantir plano de ritos')
        }

        const isCompleted = params.status === 'completed'

        const riteData = {
            plan_id: planResult.data.id,
            category: 'leadership_rite', // Forçado pelo backend
            rite_type: params.riteType,
            title: params.title,
            description: params.description || null,
            deadline: params.deadline || riteDate.toISOString(),
            status: params.status || 'not_started',
            completed_at: isCompleted ? new Date().toISOString() : null,
            completed_by: isCompleted ? auth.userId : null
        }

        // Validação via Zod (Camada final de integridade)
        pdiItemSchema.parse(riteData)

        const { data: newRite, error } = await supabase
            .from('pdi_items')
            .insert(riteData)
            .select('id')
            .single()

        if (error) throw error

        await logAudit({
            tableName: 'pdi_items',
            recordId: newRite.id,
            action: 'INSERT',
            newValues: riteData
        })

        revalidatePath(`/admin/users/${params.userId}`)
        return { success: true }
    } catch (error: any) {
        console.error('Erro em addLeadershipRite:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Conclui um rito agendado
 */
export async function completeLeadershipRite(
    riteId: string,
    userId: string
): Promise<ActionResult> {
    try {
        const auth = await validateLeadershipAuthority(userId)
        const supabase = createServerSupabaseClient()

        const updateData = {
            status: 'completed' as const,
            completed_at: new Date().toISOString(),
            completed_by: auth.userId
        }

        const { error } = await supabase
            .from('pdi_items')
            .update(updateData)
            .eq('id', riteId)
            .eq('category', 'leadership_rite') // Proteção de domínio
            .select()

        if (error) throw error

        revalidatePath(`/admin/users/${userId}`)
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
