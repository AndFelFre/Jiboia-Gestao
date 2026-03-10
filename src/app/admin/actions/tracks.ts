'use server'
import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Track, TrackStage } from '@/types'
import { trackSchema } from '@/validations/schemas'
import { getTenantContext, validateOrgAccess } from '@/lib/supabase/tenant-context'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

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
    if (code === '23505') return 'Já existe uma trilha com este nome nesta organização.'
    if (code === '23503') return 'Não é possível remover: esta trilha está vinculada a algum cargo.'
    return `Erro de Banco (${code}): ${message}`
  }

  if (message.includes('unrecognized_keys')) return 'Erro de Validação: campos extras detectados.'
  if (message === 'UNAUTHORIZED') return 'Sessão expirada. Faça login novamente.'
  if (message === 'FORBIDDEN') return 'Você não tem permissão para realizar esta ação.'

  return `Erro: ${message}`
}

interface TrackInput {
  name: string
  description?: string
  stages: TrackStage[]
}

export async function getTracks(orgId?: string): Promise<ActionResult<Track[]>> {
  try {
    // Determinar contexto multi-tenant
    const { targetOrgId, auth: userAuth } = await getTenantContext(orgId)

    const supabase = userAuth.role === 'admin'
      ? createAdminSupabaseClient()
      : createServerSupabaseClient()

    const { data, error } = await supabase
      .from('tracks')
      .select('*, organizations(name)')
      .eq('org_id', targetOrgId)
      .order('name')

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
    await validateOrgAccess(formData.org_id)

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
    const supabase = createAdminSupabaseClient()
    const { data: track } = await supabase.from('tracks').select('org_id').eq('id', id).single()
    if (!track) return { success: false, error: 'Trilha não encontrada.' }
    await validateOrgAccess(track.org_id)

    const validated = trackSchema.parse(formData)

    const { data, error } = await supabase
      .from('tracks')
      .update({
        name: validated.name.trim(),
        description: validated.description || null,
        stages: validated.stages || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Action: updateTrack] Erro:', error.message)
      return { success: false, error: sanitizeError(error) }
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
    const supabase = createAdminSupabaseClient()
    const { data: track } = await supabase.from('tracks').select('org_id').eq('id', id).single()
    if (track) await validateOrgAccess(track.org_id)

    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Action: deleteTrack] Erro:', error.message)
      return { success: false, error: sanitizeError(error) }
    }

    revalidatePath('/admin/tracks')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em deleteTrack:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}
