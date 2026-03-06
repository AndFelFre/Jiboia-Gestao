'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/supabase/auth'
import { logAudit } from '@/lib/supabase/audit'
import { sanitizeError, getErrorMessage, ActionResult } from '@/utils/errors'
import { customReportSchema, CustomReportInput } from '@/validations/schemas'
import type { CustomReport } from '@/types'

export async function createCustomReport(formData: CustomReportInput): Promise<ActionResult> {
    try {
        await requirePermission('users.manage') // Ou crie req específica: 'reports.create'
        const validated = customReportSchema.parse(formData)
        const supabase = createServerSupabaseClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Usuário não autenticado')

        // Recupera org_id do usuário logado
        const { data: userData } = await supabase
            .from('users')
            .select('org_id')
            .eq('id', user.id)
            .single()

        if (!userData?.org_id) throw new Error('Usuário sem organização')

        const { data, error } = await supabase
            .from('custom_reports')
            .insert({
                name: validated.name.trim(),
                config: validated.config,
                owner_id: user.id,
                org_id: userData.org_id
            })
            .select('id, name, config, created_at, updated_at')
            .single()

        if (error) {
            console.error('Erro ao criar relatório customizado:', error.message)
            return { success: false, error: 'Erro ao criar relatório' }
        }

        await logAudit({
            tableName: 'custom_reports',
            recordId: data.id,
            action: 'INSERT',
            newValues: data,
        })

        revalidatePath('/admin/analytics/custom')
        return { success: true, data }
    } catch (error: unknown) {
        console.error('Erro em createCustomReport:', getErrorMessage(error))
        return { success: false, error: sanitizeError(error) }
    }
}

export async function getCustomReports(): Promise<ActionResult<CustomReport[]>> {
    try {
        await requirePermission('users.manage')
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from('custom_reports')
            .select('id, name, config, org_id, created_at, updated_at')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar relatórios:', error.message)
            return { success: false, error: 'Erro ao buscar relatórios' }
        }

        return { success: true, data }
    } catch (error: unknown) {
        console.error('Erro em getCustomReports:', getErrorMessage(error))
        return { success: false, error: sanitizeError(error) }
    }
}

export async function updateCustomReport(id: string, formData: CustomReportInput): Promise<ActionResult> {
    try {
        await requirePermission('users.manage')
        const validated = customReportSchema.parse(formData)
        const supabase = createServerSupabaseClient()

        // Busca valor antigo para o log
        const { data: oldData } = await supabase.from('custom_reports').select('*').eq('id', id).single()
        if (!oldData) throw new Error('Relatório não encontrado')

        const updateData = {
            name: validated.name.trim(),
            config: validated.config,
            updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from('custom_reports')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single()

        if (error) {
            console.error('Erro ao atualizar relatório:', error.message)
            return { success: false, error: 'Erro ao atualizar relatório' }
        }

        await logAudit({
            tableName: 'custom_reports',
            recordId: id,
            action: 'UPDATE',
            oldValues: oldData,
            newValues: data,
        })

        revalidatePath('/admin/analytics/custom')
        return { success: true, data }
    } catch (error: unknown) {
        console.error('Erro em updateCustomReport:', getErrorMessage(error))
        return { success: false, error: sanitizeError(error) }
    }
}

export async function deleteCustomReport(id: string): Promise<ActionResult> {
    try {
        await requirePermission('users.manage')
        const supabase = createServerSupabaseClient()

        const { data: oldData } = await supabase.from('custom_reports').select('*').eq('id', id).single()

        const { error } = await supabase
            .from('custom_reports')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Erro ao deletar relatório:', error.message)
            return { success: false, error: 'Erro ao excluir relatório' }
        }

        if (oldData) {
            await logAudit({
                tableName: 'custom_reports',
                recordId: id,
                action: 'DELETE',
                oldValues: oldData,
            })
        }

        revalidatePath('/admin/analytics/custom')
        return { success: true }
    } catch (error: unknown) {
        console.error('Erro em deleteCustomReport:', getErrorMessage(error))
        return { success: false, error: sanitizeError(error) }
    }
}

