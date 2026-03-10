'use server'

import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { unitSchema, type UnitInput } from '@/validations/schemas'
import { revalidatePath, revalidateTag } from 'next/cache'
import { sanitizeError } from '@/lib/utils'
import { getTenantContext, validateOrgAccess } from '@/lib/supabase/tenant-context'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export async function getUnits(orgId?: string): Promise<ActionResult> {
  try {
    // Determinar contexto multi-tenant
    const { targetOrgId, auth: userAuth } = await getTenantContext(orgId)

    const supabase = userAuth.role === 'admin'
      ? createAdminSupabaseClient()
      : createServerSupabaseClient()

    const { data, error } = await supabase
      .from('units')
      .select('id, org_id, name, parent_id, created_at, updated_at, organizations(name)')
      .is('deleted_at', null)
      .eq('org_id', targetOrgId)
      .order('name')

    if (error) {
      console.error('Erro ao buscar unidades:', error.message)
      return { success: false, error: 'Erro ao buscar dados' }
    }

    return { success: true, data }
  } catch (error: unknown) {
    console.error('Erro em getUnits:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function createUnit(formData: UnitInput & { org_id: string }): Promise<ActionResult> {
  try {
    const auth = await requirePermission('unit.manage')
    await validateOrgAccess(formData.org_id)
    const { org_id, ...unitInput } = formData
    const validated = unitSchema.parse(unitInput)
    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from('units')
      .insert({
        org_id: formData.org_id,
        name: validated.name.trim(),
        parent_id: validated.parent_id || null,
      })
      .select('id, org_id, name, parent_id, created_at, updated_at')
      .single()

    if (error) {
      console.error('[Action: createUnit] Erro do Supabase:', error.message)
      return { success: false, error: sanitizeError(error) }
    }

    revalidateTag('admin-units')
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Erro em createUnit:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function updateUnit(id: string, formData: UnitInput & { org_id: string }): Promise<ActionResult> {
  try {
    const auth = await requirePermission('unit.manage')
    const { org_id, ...unitInput } = formData
    const validated = unitSchema.parse(unitInput)
    const supabase = createAdminSupabaseClient()

    if (auth.role !== 'admin') {
      const { data: unit } = await supabase
        .from('units')
        .select('org_id')
        .eq('id', id)
        .single()

      if (unit?.org_id !== auth.orgId) {
        throw new Error('FORBIDDEN')
      }
    }

    const { data, error } = await supabase
      .from('units')
      .update({
        name: validated.name.trim(),
        parent_id: validated.parent_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, org_id, name, parent_id, created_at, updated_at')
      .single()

    if (error) {
      console.error('[Action: updateUnit] Erro do Supabase:', error.message)
      return { success: false, error: sanitizeError(error) }
    }

    revalidateTag('admin-units')
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Erro em updateUnit:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function deleteUnit(id: string): Promise<ActionResult> {
  try {
    const auth = await requirePermission('unit.manage')
    const supabase = createAdminSupabaseClient()

    if (auth.role !== 'admin') {
      const { data: unit } = await supabase
        .from('units')
        .select('org_id')
        .eq('id', id)
        .single()

      if (unit?.org_id !== auth.orgId) {
        throw new Error('FORBIDDEN')
      }
    }

    // Soft Delete: Preservação Histórica
    const { error } = await supabase.rpc('soft_delete_record', {
      target_table: 'units',
      target_id: id
    })

    if (error) {
      console.error('[Action: deleteUnit] Erro do Supabase:', error.message)
      return { success: false, error: sanitizeError(error) }
    }

    revalidateTag('admin-units')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em deleteUnit:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function restoreUnit(id: string): Promise<ActionResult> {
  try {
    const auth = await requirePermission('unit.manage')
    const supabase = createAdminSupabaseClient()

    // Restore via RPC (valida se a org pai não está deletada)
    const { error } = await supabase.rpc('restore_record', {
      target_table: 'units',
      target_id: id
    })

    if (error) {
      console.error('[Action: restoreUnit] Erro do Supabase:', error.message)
      return { success: false, error: sanitizeError(error) }
    }

    revalidateTag('admin-units')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em restoreUnit:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

