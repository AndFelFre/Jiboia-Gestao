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
  const code = (error as any)?.code

  if (code) {
    if (code === '23505') return 'Este usuário (e-mail) já está cadastrado.'
    return `Erro de Banco (${code}): ${message}`
  }

  if (message.includes('unrecognized_keys')) return 'Erro de Validação: campos extras detectados.'
  if (message === 'UNAUTHORIZED') return 'Sessão expirada. Faça login novamente.'
  if (message === 'FORBIDDEN') return 'Você não tem permissão para realizar esta ação.'

  return `Erro: ${message}`
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

import { userSchema, type UserInput } from '@/validations/schemas'

export async function inviteUser(formData: UserInput & { org_id: string }): Promise<ActionResult> {
  try {
    const auth = await requirePermission('users.manage')

    if (auth.role !== 'admin' && formData.org_id !== auth.orgId) {
      throw new Error('FORBIDDEN')
    }

    const { org_id, ...userInput } = formData
    const validated = userSchema.parse(userInput)
    const supabase = createAdminSupabaseClient()

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validated.email,
      password: Math.random().toString(36).slice(-8),
      email_confirm: true,
      user_metadata: { full_name: validated.full_name }
    })

    if (authError) {
      console.error('[Action: inviteUser] Erro no Auth do Supabase:', authError.message)
      return { success: false, error: authError.message }
    }

    const userData = {
      id: authData.user.id,
      email: validated.email,
      full_name: validated.full_name,
      org_id: formData.org_id,
      unit_id: validated.unit_id,
      role_id: validated.role_id,
      position_id: validated.position_id || null,
      status: 'pending'
    }

    const { error: dbError } = await supabase
      .from('users')
      .insert(userData)

    if (dbError) {
      console.error('[Action: inviteUser] Erro no banco de dados:', dbError.message)
      return { success: false, error: sanitizeError(dbError) }
    }

    await logAudit({
      tableName: 'users',
      recordId: authData.user.id,
      action: 'INSERT',
      newValues: userData,
    })

    sendWelcomeEmail(validated.email, validated.full_name).catch(console.error)

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
      return { success: false, error: sanitizeError(error) }
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
