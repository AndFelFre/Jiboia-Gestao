'use server'
import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { User } from '@/types'
import { logAudit } from '@/lib/supabase/audit'
import { sendWelcomeEmail } from './notifications'

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
  if (message === 'UNAUTHORIZED') return 'Sessão expirada. Faça login novamente.'
  if (message === 'FORBIDDEN') return 'Você não tem permissão para realizar esta ação.'
  return 'Erro ao processar solicitação.'
}

export async function getUsers(orgId?: string): Promise<ActionResult<User[]>> {
  try {
    const auth = await requireAuth()
    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('users')
      .select('*, organizations(name), units(name), roles(name)')
      .order('full_name')

    // Isolamento multi-tenant
    if (auth.role !== 'admin') {
      query = query.eq('org_id', auth.orgId)
    } else if (orgId) {
      query = query.eq('org_id', orgId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      return { success: false, error: 'Erro ao buscar dados' }
    }

    return { success: true, data: data as User[] }
  } catch (error: unknown) {
    console.error('Erro em getUsers:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function inviteUser(formData: {
  email: string
  full_name: string
  org_id: string
  unit_id: string
  role_id: string
}): Promise<ActionResult> {
  try {
    const auth = await requirePermission('users.manage')

    if (auth.role !== 'admin' && formData.org_id !== auth.orgId) {
      throw new Error('FORBIDDEN')
    }

    const supabase = createAdminSupabaseClient()

    // Cria usuário no auth vindo de admin console
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: formData.email,
      password: Math.random().toString(36).slice(-8),
      email_confirm: true,
      user_metadata: { full_name: formData.full_name }
    })

    if (authError) {
      console.error('[Action: inviteUser] Erro no Auth do Supabase:', authError.message)
      return { success: false, error: authError.message }
    }

    const userData = {
      id: authData.user.id,
      email: formData.email,
      full_name: formData.full_name,
      org_id: formData.org_id,
      unit_id: formData.unit_id,
      role_id: formData.role_id,
      status: 'pending'
    }

    const { error: dbError } = await supabase
      .from('users')
      .insert(userData)

    if (dbError) {
      console.error('[Action: inviteUser] Erro no banco de dados:', dbError.message)
      return { success: false, error: 'Erro ao salvar perfil do usuário.' }
    }

    await logAudit({
      tableName: 'users',
      recordId: authData.user.id,
      action: 'INSERT',
      newValues: userData,
    })

    // Dispara e-mail de boas-vindas (assíncrono)
    sendWelcomeEmail(formData.email, formData.full_name).catch(console.error)

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em inviteUser:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function updateUserStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const auth = await requirePermission('users.manage')
    const supabase = createAdminSupabaseClient()

    const { data: oldData } = await supabase.from('users').select('*').eq('id', id).single()

    if (auth.role !== 'admin') {
      if (oldData?.org_id !== auth.orgId) throw new Error('FORBIDDEN')
    }

    const { error } = await supabase
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('[Action: updateUserStatus] Erro no banco:', error.message)
      return { success: false, error: 'Erro ao atualizar status do usuário.' }
    }

    await logAudit({
      tableName: 'users',
      recordId: id,
      action: 'UPDATE',
      oldValues: oldData,
      newValues: { status },
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em updateUserStatus:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}
