'use server'
import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { positionSchema, type PositionInput } from '@/validations/schemas'
import { revalidatePath } from 'next/cache'
import type { Position } from '@/types'
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

const sanitizeError = (error: unknown) => {
  const { sanitizeError: centralSanitizeError } = require('@/lib/utils')
  return centralSanitizeError(error)
}

export async function getPositions(orgId?: string): Promise<ActionResult<Position[]>> {
  try {
    const auth = await requireAuth()
    const supabase = createServerSupabaseClient()

    // Query simplificada para evitar falhas críticas em joins se RLS for restritivo
    let query = supabase
      .from('positions')
      .select('*, organizations(name), levels(name, sequence)')
      .order('title')

    if (auth.role !== 'admin') {
      query = query.eq('org_id', auth.orgId)
    } else if (orgId) {
      query = query.eq('org_id', orgId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[Action: getPositions] Erro do Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })

      // Tentativa de fallback sem joins se o erro for de permissão/RLS no join
      if (error.code === '42501' || error.message?.includes('permission')) {
        console.log('[Action: getPositions] Tentando fallback sem joins...')
        const fallback = await supabase
          .from('positions')
          .select('*')
          .order('title')

        if (!fallback.error) {
          return { success: true, data: fallback.data as Position[] }
        }
      }

      return { success: false, error: sanitizeError(error) }
    }

    return { success: true, data: data as Position[] }
  } catch (error: unknown) {
    console.error('Erro crítico em getPositions:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function createPosition(formData: PositionInput & { org_id: string }): Promise<ActionResult<Position>> {
  try {
    const auth = await requirePermission('org.manage')

    if (auth.role !== 'admin' && formData.org_id !== auth.orgId) {
      throw new Error('FORBIDDEN')
    }

    const { org_id, ...positionInput } = formData
    const validated = positionSchema.parse(positionInput)
    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from('positions')
      .insert({
        org_id: formData.org_id,
        title: validated.title.trim(),
        level_id: validated.level_id || null,
        track_id: validated.track_id || null,
        description: validated.description || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[Action: createPosition] Erro do Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error: sanitizeError(error) }
    }

    await logAudit({
      tableName: 'positions',
      recordId: data.id,
      action: 'INSERT',
      newValues: data,
    })

    revalidatePath('/admin/positions')
    return { success: true, data: data as Position }
  } catch (error: unknown) {
    console.error('Erro em createPosition:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function updatePosition(id: string, formData: PositionInput & { org_id: string }): Promise<ActionResult<Position>> {
  try {
    const auth = await requirePermission('org.manage')
    const { org_id, ...positionInput } = formData
    const validated = positionSchema.parse(positionInput)
    const supabase = createAdminSupabaseClient()

    // Valor antigo
    const { data: oldData } = await supabase.from('positions').select('*').eq('id', id).single()

    if (auth.role !== 'admin') {
      if (oldData?.org_id !== auth.orgId) throw new Error('FORBIDDEN')
    }

    const { data, error } = await supabase
      .from('positions')
      .update({
        title: validated.title.trim(),
        level_id: validated.level_id || null,
        track_id: validated.track_id || null,
        description: validated.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Action: updatePosition] Erro do Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error: sanitizeError(error) }
    }

    await logAudit({
      tableName: 'positions',
      recordId: id,
      action: 'UPDATE',
      oldValues: oldData,
      newValues: data,
    })

    revalidatePath('/admin/positions', 'page')
    return { success: true, data: data as Position }
  } catch (error: unknown) {
    console.error('Erro em updatePosition:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function deletePosition(id: string): Promise<ActionResult> {
  try {
    const auth = await requirePermission('org.manage')
    const supabase = createAdminSupabaseClient()

    // Valor antigo
    const { data: oldData } = await supabase.from('positions').select('*').eq('id', id).single()

    if (auth.role !== 'admin') {
      if (oldData?.org_id !== auth.orgId) throw new Error('FORBIDDEN')
    }

    const { error } = await supabase
      .from('positions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Action: deletePosition] Erro:', error.message)
      return { success: false, error: sanitizeError(error) }
    }

    await logAudit({
      tableName: 'positions',
      recordId: id,
      action: 'DELETE',
      oldValues: oldData,
    })

    revalidatePath('/admin/positions', 'page')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em deletePosition:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}
