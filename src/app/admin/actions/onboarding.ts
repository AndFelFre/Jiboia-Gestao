'use server'

import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/supabase/audit'

/**
 * Busca todos os templates de onboarding da organização
 */
export async function getOnboardingTemplates() {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from('onboarding_templates')
            .select('*, onboarding_items(*)')
            .eq('org_id', auth.orgId)
            .order('name')

        if (error) throw error
        return { success: true, data }
    } catch (error: unknown) {
        const err = error as Error;
        return { success: false, error: err.message }
    }
}

/**
 * Cria um novo template de onboarding
 */
export async function createOnboardingTemplate(name: string, description: string) {
    try {
        const auth = await requirePermission('onboarding.manage')
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from('onboarding_templates')
            .insert({ org_id: auth.orgId, name, description })
            .select()
            .single()

        if (error) throw error

        await logAudit({
            tableName: 'onboarding_templates',
            recordId: data.id,
            action: 'INSERT',
            newValues: data
        })

        revalidatePath('/admin/onboarding')
        return { success: true, data }
    } catch (error: unknown) {
        const err = error as Error;
        return { success: false, error: err.message }
    }
}

/**
 * Adiciona um item ao template
 */
export async function addOnboardingItem(templateId: string, title: string, description: string, sequence: number) {
    try {
        const auth = await requirePermission('onboarding.manage')
        const supabase = createServerSupabaseClient()

        // VALIDATION: Cross-tenant check
        const { data: tempCheck, error: tempErr } = await supabase
            .from('onboarding_templates')
            .select('org_id')
            .eq('id', templateId)
            .single()

        if (tempErr || tempCheck?.org_id !== auth.orgId) {
            throw new Error('Template não encontrado ou sem acesso.')
        }

        const { data, error } = await supabase
            .from('onboarding_items')
            .insert({ template_id: templateId, title, description, sequence })
            .select()
            .single()

        if (error) throw error

        await logAudit({
            tableName: 'onboarding_items',
            recordId: data.id,
            action: 'INSERT',
            newValues: data
        })

        revalidatePath('/admin/onboarding')
        return { success: true, data }
    } catch (error: unknown) {
        const err = error as Error;
        return { success: false, error: err.message }
    }
}

/**
 * Atribui um template a um usuário (novo colaborador)
 */
export async function assignOnboardingToUser(userId: string, templateId: string) {
    try {
        const auth = await requirePermission('onboarding.manage')
        const supabase = createServerSupabaseClient()

        // 1. VALIDATION: Cross-tenant check for template and user
        const { data: tempData, error: tempErr } = await supabase
            .from('onboarding_templates')
            .select('org_id')
            .eq('id', templateId)
            .single()

        const { data: userData, error: userErr } = await supabase
            .from('users')
            .select('org_id')
            .eq('id', userId)
            .single()

        if (tempErr || userErr || tempData?.org_id !== auth.orgId || userData?.org_id !== auth.orgId) {
            throw new Error('Template ou Usuário não pertencem à sua organização.')
        }

        // 2. Busca os itens do template
        const { data: items, error: itemsError } = await supabase
            .from('onboarding_items')
            .select('*')
            .eq('template_id', templateId)

        if (itemsError) throw itemsError
        if (!items || items.length === 0) throw new Error('Template sem itens')

        // 3. Cria o progresso inicial para cada item
        const progressData = items.map(item => ({
            org_id: auth.orgId,
            user_id: userId,
            template_id: templateId,
            item_id: item.id,
            status: 'pending'
        }))

        const { error: progressError } = await supabase
            .from('user_onboarding_progress')
            .insert(progressData)

        if (progressError) throw progressError

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: unknown) {
        const err = error as Error;
        return { success: false, error: err.message }
    }
}

/**
 * Marca um item como concluído
 */
export async function toggleOnboardingItem(progressId: string, status: 'completed' | 'pending') {
    try {
        const auth = await requireAuth()
        const supabase = createServerSupabaseClient()

        const { error } = await supabase
            .from('user_onboarding_progress')
            .update({
                status: status,
                completed_at: status === 'completed' ? new Date().toISOString() : null,
                completed_by: status === 'completed' ? auth.userId : null
            })
            .eq('id', progressId)
            .eq('org_id', auth.orgId) // Security: ensure org matches

        if (error) throw error

        // Check if all items are completed to log a special event
        const { data: currentProgress } = await supabase
            .from('user_onboarding_progress')
            .select('user_id')
            .eq('id', progressId)
            .single()

        if (currentProgress) {
            const { data: totalProgress } = await supabase
                .from('user_onboarding_progress')
                .select('status')
                .eq('user_id', currentProgress.user_id)

            const allDone = totalProgress?.every(i => i.status === 'completed')

            if (allDone) {
                await logAudit({
                    tableName: 'user_onboarding_progress',
                    recordId: progressId,
                    action: 'UPDATE',
                    newValues: { message: 'ONBOARDING_COMPLETED' }
                })
            }
        }

        revalidatePath('/dashboard/meu-perfil')
        return { success: true }
    } catch (error: unknown) {
        const err = error as Error;
        return { success: false, error: err.message }
    }
}

