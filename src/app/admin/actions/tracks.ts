'use server'
import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Track, TrackStage } from '@/types'
import { trackSchema } from '@/validations/schemas'

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
    return `Erro de Banco (${code}): ${message}`
  }

  if (message.includes('unrecognized_keys')) return 'Erro de Validação: campos extras detectados.'
  if (message === 'UNAUTHORIZED') return 'Sessão expirada.'
  if (message === 'FORBIDDEN') return 'Acesso negado.'

  return `Erro: ${message}`
}

interface TrackInput {
  name: string
  description?: string
  stages: TrackStage[]
}

export async function getTracks(orgId?: string): Promise<ActionResult<Track[]>> {
  try {
    const auth = await requireAuth()
    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('tracks')
      .select('*, organizations(name)')
      .order('name')

    if (auth.role !== 'admin') {
      query = query.eq('org_id', auth.orgId)
    } else if (orgId) {
      query = query.eq('org_id', orgId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar trilhas:', error.message)
      return { success: false, error: 'Erro ao buscar dados' }
    }

    return { success: true, data: data as Track[] }
  } catch (error: unknown) {
    console.error('Erro em getTracks:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function createTrack(formData: TrackInput & { org_id: string }): Promise<ActionResult<Track>> {
  try {
    const auth = await requirePermission('org.manage')

    if (auth.role !== 'admin' && formData.org_id !== auth.orgId) {
      throw new Error('FORBIDDEN')
    }

    const { org_id, ...trackInput } = formData
    const validated = trackSchema.parse(trackInput)
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('tracks')
      .insert({
        org_id: formData.org_id,
        name: formData.name.trim(),
        description: formData.description || null,
        stages: formData.stages || [],
      })
      .select()
      .single()

    if (error) {
      console.error('[Action: createTrack] Erro do Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error: sanitizeError(error) }
    }

    revalidatePath('/admin/tracks')
    return { success: true, data: data as Track }
  } catch (error: unknown) {
    console.error('Erro em createTrack:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function updateTrack(id: string, formData: TrackInput & { org_id: string }): Promise<ActionResult<Track>> {
  try {
    const auth = await requirePermission('org.manage')
    const { org_id, ...trackInput } = formData
    const validated = trackSchema.parse(trackInput)
    const supabase = createServerSupabaseClient()

    if (auth.role !== 'admin') {
      const { data: track } = await supabase.from('tracks').select('org_id').eq('id', id).single()
      if (track?.org_id !== auth.orgId) throw new Error('FORBIDDEN')
    }

    const { data, error } = await supabase
      .from('tracks')
      .update({
        name: formData.name.trim(),
        description: formData.description || null,
        stages: formData.stages || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar trilha:', error.message)
      return { success: false, error: 'Erro ao atualizar trilha' }
    }

    revalidatePath('/admin/tracks')
    return { success: true, data: data as Track }
  } catch (error: unknown) {
    console.error('Erro em updateTrack:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function deleteTrack(id: string): Promise<ActionResult> {
  try {
    const auth = await requirePermission('org.manage')
    const supabase = createServerSupabaseClient()

    if (auth.role !== 'admin') {
      const { data: track } = await supabase.from('tracks').select('org_id').eq('id', id).single()
      if (track?.org_id !== auth.orgId) throw new Error('FORBIDDEN')
    }

    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar trilha:', error.message)
      return { success: false, error: 'Erro ao remover trilha' }
    }

    revalidatePath('/admin/tracks')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em deleteTrack:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}
