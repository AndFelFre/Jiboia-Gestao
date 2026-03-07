'use server'
import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { levelSchema, type LevelInput } from '@/validations/schemas'
import { revalidatePath } from 'next/cache'
import type { Level } from '@/types'

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
  const message = getErrorMessage(error)
  const code = (error as any)?.code

  if (code) {
    if (code === '23505') return 'Já existe um nível com este nome ou sequência nesta organização.'
    if (code === '23503') return 'Não é possível remover: este nível está vinculado a algum cargo.'
    return `Erro de Banco (${code}): ${message}`
  }

  if (message.includes('unrecognized_keys')) return 'Erro de Validação: campos extras detectados.'
  if (message === 'UNAUTHORIZED') return 'Sessão expirada. Faça login novamente.'
  if (message === 'FORBIDDEN') return 'Você não tem permissão para realizar esta ação.'

  return `Erro: ${message}`
}

export async function getLevels(orgId?: string): Promise<ActionResult<Level[]>> {
  try {
    const auth = await requireAuth()
    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('levels')
      .select('*')
      .order('sequence', { ascending: true })

    if (auth.role !== 'admin') {
      query = query.eq('org_id', auth.orgId)
    } else if (orgId) {
      query = query.eq('org_id', orgId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar níveis:', error.message)
      return { success: false, error: 'Erro ao buscar dados' }
    }

    return { success: true, data: data as Level[] }
  } catch (error: unknown) {
    console.error('Erro em getLevels:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function createLevel(formData: LevelInput & { org_id: string }): Promise<ActionResult<Level>> {
  try {
    const auth = await requirePermission('org.manage')

    if (auth.role !== 'admin' && formData.org_id !== auth.orgId) {
      throw new Error('FORBIDDEN')
    }

    const { org_id, ...levelInput } = formData;
    const validated = levelSchema.parse(levelInput)
    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from('levels')
      .insert({
        org_id: formData.org_id,
        name: validated.name.trim(),
        sequence: validated.sequence,
        min_time_months: validated.min_time_months,
        description: validated.description || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[Action: createLevel] Erro do Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error: sanitizeError(error) }
    }

    revalidatePath('/admin/levels')
    return { success: true, data: data as Level }
  } catch (error: unknown) {
    console.error('Erro em createLevel:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function updateLevel(id: string, formData: LevelInput & { org_id: string }): Promise<ActionResult<Level>> {
  try {
    const auth = await requirePermission('org.manage')
    const { org_id, ...levelInput } = formData;
    const validated = levelSchema.parse(levelInput)
    const supabase = createAdminSupabaseClient()

    if (auth.role !== 'admin') {
      const { data: level } = await supabase.from('levels').select('org_id').eq('id', id).single()
      if (level?.org_id !== auth.orgId) throw new Error('FORBIDDEN')
    }

    const { data, error } = await supabase
      .from('levels')
      .update({
        name: validated.name.trim(),
        sequence: validated.sequence,
        min_time_months: validated.min_time_months,
        description: validated.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Action: updateLevel] Erro do Supabase:', error.message)
      return { success: false, error: sanitizeError(error) }
    }

    revalidatePath('/admin/levels')
    return { success: true, data: data as Level }
  } catch (error: unknown) {
    console.error('Erro em updateLevel:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function deleteLevel(id: string): Promise<ActionResult> {
  try {
    const auth = await requirePermission('org.manage')
    const supabase = createAdminSupabaseClient()

    if (auth.role !== 'admin') {
      const { data: level } = await supabase.from('levels').select('org_id').eq('id', id).single()
      if (level?.org_id !== auth.orgId) throw new Error('FORBIDDEN')
    }

    const { error } = await supabase
      .from('levels')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Action: deleteLevel] Erro do Supabase:', error.message)
      return { success: false, error: sanitizeError(error) }
    }

    revalidatePath('/admin/levels')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em deleteLevel:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}
