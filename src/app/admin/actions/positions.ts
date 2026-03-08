'use server'
import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { positionSchema, type PositionInput } from '@/validations/schemas'
import { revalidateTag } from 'next/cache'
import { setAuditContext } from '@/lib/supabase/audit'
import type { Position } from '@/types'

interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

function sanitizeError(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null) {
    const e = error as { message?: string; code?: string }
    if (e.code === '23505') return 'Este cargo já está cadastrado nesta organização.'
    if (e.code === '23503') return 'Não é possível remover este cargo pois ele possui registros vinculados.'
    if (e.message) return e.message
  }
  return String(error)
}

export async function getPositions(orgId?: string): Promise<ActionResult<Position[]>> {
  try {
    const auth = await requireAuth()
    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('positions')
      .select('*, organizations(name), levels(name, sequence)')
      .is('deleted_at', null)
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

    // Segurança multi-tenant: usuário não-admin só cria na própria org
    if (auth.role !== 'admin' && formData.org_id !== auth.orgId) {
      throw new Error('FORBIDDEN')
    }

    const { org_id, ...positionInput } = formData
    const validated = positionSchema.parse(positionInput)

    // Superadmin opera cross-org (precisa admin client)
    // User normal: RLS valida org_id no banco
    const supabase = auth.role === 'admin'
      ? createAdminSupabaseClient()
      : createServerSupabaseClient()

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
        code: error.code
      })
      return { success: false, error: sanitizeError(error) }
    }

    // Auditoria via Trigger Master (081)
    revalidateTag('admin-positions')
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

    // Superadmin opera cross-org (precisa admin client)
    const supabase = auth.role === 'admin'
      ? createAdminSupabaseClient()
      : createServerSupabaseClient()

    // Verificar posse multi-tenant
    const { data: oldData } = await supabase.from('positions').select('org_id').eq('id', id).single()
    if (!oldData) return { success: false, error: 'Cargo não encontrado.' }
    if (auth.role !== 'admin' && oldData.org_id !== auth.orgId) {
      throw new Error('FORBIDDEN')
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
        code: error.code
      })
      return { success: false, error: sanitizeError(error) }
    }

    // Auditoria via Trigger Master (081)
    revalidateTag('admin-positions')
    return { success: true, data: data as Position }
  } catch (error: unknown) {
    console.error('Erro em updatePosition:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function deletePosition(id: string): Promise<ActionResult> {
  try {
    await requirePermission('org.manage')
    const supabase = createAdminSupabaseClient()

    await setAuditContext('Arquivamento de cargo')

    // Soft Delete via RPC (SECURITY DEFINER - precisa do admin client)
    const { error } = await supabase.rpc('soft_delete_record', {
      target_table: 'positions',
      target_id: id
    })

    if (error) {
      console.error('[Action: deletePosition] Erro:', error.message)
      // Captura erro do Trigger check_position_archival (proteção contra arquivamento)
      if (error.message?.includes('usuários ativos vinculados')) {
        return { success: false, error: error.message }
      }
      return { success: false, error: sanitizeError(error) }
    }

    revalidateTag('admin-positions')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em deletePosition:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function restorePosition(id: string): Promise<ActionResult> {
  try {
    await requirePermission('org.manage')
    const supabase = createAdminSupabaseClient()

    await setAuditContext('Restauração de cargo arquivado')

    const { error } = await supabase.rpc('restore_record', {
      target_table: 'positions',
      target_id: id
    })

    if (error) {
      console.error('[Action: restorePosition] Erro:', error.message)
      return { success: false, error: sanitizeError(error) }
    }

    revalidateTag('admin-positions')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em restorePosition:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}
