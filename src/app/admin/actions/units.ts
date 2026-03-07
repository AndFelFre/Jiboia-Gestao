'use server'

import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { unitSchema, type UnitInput } from '@/validations/schemas'
import { revalidatePath } from 'next/cache'
// Unit type used via inference

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
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const pgError = error as { code: string; message: string };
    if (pgError.code === '23505') return 'Já existe um registro com estes dados (duplicidade).';
    if (pgError.code === '42501') return 'Permissão de gravação negada no banco de dados.';
    if (pgError.code === '23503') return 'Não é possível remover: existem outros registros vinculados.';
    return `Erro de Banco (${pgError.code}): ${pgError.message}`;
  }

  const message = getErrorMessage(error)
  if (message.includes('unrecognized_keys')) return 'Erro de Validação: campos inesperados detectados.'
  if (message === 'UNAUTHORIZED') return 'Sessão expirada.'
  if (message === 'FORBIDDEN') return 'Acesso negado.'

  return `Erro: ${message}`
}

export async function getUnits(orgId?: string): Promise<ActionResult> {
  try {
    const auth = await requireAuth()

    // Admin/Leader podem ver unidades (via RLS ou middleware, mas aqui reforçamos)
    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('units')
      .select('id, org_id, name, parent_id, created_at, updated_at, organizations(name)')
      .order('name')

    // Isolamento: se não for admin, forçamos a org do usuário
    if (auth.role !== 'admin') {
      query = query.eq('org_id', auth.orgId)
    } else if (orgId) {
      // Admin pode filtrar por uma org específica
      query = query.eq('org_id', orgId)
    }

    const { data, error } = await query

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
      console.error('[Action: createUnit] Erro do Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error: sanitizeError(error) }
    }

    revalidatePath('/admin/units')
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Erro em createUnit:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function updateUnit(id: string, formData: UnitInput & { org_id: string }): Promise<ActionResult> {
  try {
    const auth = await requirePermission('unit.manage')

    const validated = unitSchema.parse(formData)
    const supabase = createAdminSupabaseClient()

    // Verifica se a unidade pertence Ã  org do usuário
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
      console.error('[Action: updateUnit] Erro do Supabase:', error.message, error.details, error.hint)
      return { success: false, error: sanitizeError(error) }
    }

    revalidatePath('/admin/units')
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

    // Verifica se a unidade pertence Ã  org do usuário
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

    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Action: deleteUnit] Erro do Supabase:', error.message, error.details, error.hint)
      return { success: false, error: 'Erro ao remover unidade.' }
    }

    revalidatePath('/admin/units')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em deleteUnit:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

