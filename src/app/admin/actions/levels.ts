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
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const pgError = error as { code: string; message: string; details: string };
    if (pgError.code === '23505') return 'Já existe um registro com estes dados (duplicidade).';
    if (pgError.code === '42501') return 'Você não tem permissão para realizar esta operação no banco de dados.';
    if (pgError.code === '23503') return 'Não é possível excluir: existem outros registros vinculados a este.';
  }

  const message = getErrorMessage(error)
  if (message === 'UNAUTHORIZED') return 'Sessão expirada. Faça login novamente.'
  if (message === 'FORBIDDEN') return 'Você não tem permissão para realizar esta ação.'
  if (message.includes('validation')) return 'Dados inválidos. Verifique os campos preenchidos.'

  return 'Erro ao processar solicitação. Tente novamente mais tarde.'
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

    const validated = levelSchema.parse(formData)
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
    const validated = levelSchema.parse(formData)
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
      console.error('[Action: updateLevel] Erro do Supabase:', error.message, error.details, error.hint)
      return { success: false, error: 'Erro ao atualizar nível.' }
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
      console.error('[Action: deleteLevel] Erro do Supabase:', error.message, error.details, error.hint)
      return { success: false, error: 'Erro ao remover nível.' }
    }

    revalidatePath('/admin/levels')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em deleteLevel:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}
