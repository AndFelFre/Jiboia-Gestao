'use server'
import { requirePermission } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { organizationSchema, type OrganizationInput } from '@/validations/schemas'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/supabase/audit'

interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: string }).message === 'string'
  )
}

function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) return error.message
  return String(error)
}

function sanitizeError(error: unknown): string {
  const message = getErrorMessage(error)
  if (message === 'UNAUTHORIZED') return 'Sessão expirada. Faça login novamente.'
  if (message === 'FORBIDDEN') return 'Você não tem permissão para realizar esta ação.'
  if (message === 'ACCOUNT_INACTIVE') return 'Sua conta está inativa.'
  if (message === 'USER_NOT_FOUND') return 'Usuário não encontrado.'
  return 'Erro ao processar solicitação.'
}

export async function getOrganizations(): Promise<ActionResult> {
  try {
    const auth = await requirePermission('org.manage')
    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('organizations')
      .select('id, name, slug, settings, created_at, updated_at')
      .order('name')

    if (auth.role !== 'admin' && auth.orgId) {
      query = query.eq('id', auth.orgId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar organizações:', error.message)
      return { success: false, error: 'Erro ao buscar dados' }
    }

    return { success: true, data }
  } catch (error: unknown) {
    console.error('Erro em getOrganizations:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function createOrganization(formData: OrganizationInput): Promise<ActionResult> {
  try {
    await requirePermission('org.manage')
    const validated = organizationSchema.parse(formData)
    const supabase = createServerSupabaseClient()

    const domainToSave = validated.custom_domain?.trim() || null

    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name: validated.name.trim(),
        slug: validated.slug.toLowerCase().trim(),
        custom_domain: domainToSave,
        settings: validated.settings || {},
      })
      .select('id, name, slug, custom_domain, settings, created_at, updated_at')
      .single()

    if (error) {
      console.error('Erro ao criar organização:', error.message)
      return { success: false, error: 'Erro ao criar organização' }
    }

    await logAudit({
      tableName: 'organizations',
      recordId: data.id,
      action: 'INSERT',
      newValues: data,
    })

    revalidatePath('/admin/organizations')
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Erro em createOrganization:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function updateOrganization(id: string, formData: OrganizationInput): Promise<ActionResult> {
  try {
    await requirePermission('org.manage')
    const validated = organizationSchema.parse(formData)
    const supabase = createServerSupabaseClient()

    // Busca valor antigo para o log
    const { data: oldData } = await supabase.from('organizations').select('*').eq('id', id).single()

    const domainToSave = validated.custom_domain?.trim() || null

    const updateData: Record<string, unknown> = {
      name: validated.name.trim(),
      slug: validated.slug.toLowerCase().trim(),
      custom_domain: domainToSave,
      updated_at: new Date().toISOString(),
    }

    if (validated.settings) {
      updateData.settings = validated.settings
    }

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select('id, name, slug, custom_domain, settings, created_at, updated_at')
      .single()

    if (error) {
      console.error('Erro ao atualizar organização:', error.message)
      return { success: false, error: 'Erro ao atualizar organização' }
    }

    await logAudit({
      tableName: 'organizations',
      recordId: id,
      action: 'UPDATE',
      oldValues: oldData,
      newValues: data,
    })

    revalidatePath('/admin/organizations')
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Erro em updateOrganization:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function deleteOrganization(id: string): Promise<ActionResult> {
  try {
    await requirePermission('org.manage')
    const supabase = createServerSupabaseClient()

    const { data: oldData } = await supabase.from('organizations').select('*').eq('id', id).single()

    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar organização:', error.message)
      return { success: false, error: 'Erro ao remover organização' }
    }

    await logAudit({
      tableName: 'organizations',
      recordId: id,
      action: 'DELETE',
      oldValues: oldData,
    })

    revalidatePath('/admin/organizations')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em deleteOrganization:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

