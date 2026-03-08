'use server'
import { requirePermission, requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { User } from '@/types'
import { logAudit, setAuditContext } from '@/lib/supabase/audit'
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
    if (code === '23503') return 'Não é possível remover este usuário pois ele possui registros vinculados (ex: PDI ou Avaliações).'
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
      .is('deleted_at', null) // Filtragem de ativos (Soft Delete)
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

    revalidateTag('admin-users')
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

    revalidateTag('admin-users')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em updateUserStatus:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function deleteUser(id: string, reason?: string): Promise<ActionResult> {
  try {
    const auth = await requirePermission('users.manage')
    const supabase = createAdminSupabaseClient()

    if (reason) {
      await setAuditContext(`Desativação de usuário: ${reason}`)
    }

    // Soft Delete via RPC
    const { error } = await supabase.rpc('soft_delete_record', {
      target_table: 'users',
      target_id: id
    })

    if (error) {
      console.error('[Action: deleteUser] Erro:', error.message)
      return { success: false, error: sanitizeError(error) }
    }

    revalidateTag('admin-users')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em deleteUser:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function restoreUser(id: string): Promise<ActionResult> {
  try {
    await requirePermission('users.manage')
    const supabase = createAdminSupabaseClient()

    await setAuditContext('Restauração de usuário arquivado')

    const { error } = await supabase.rpc('restore_record', {
      target_table: 'users',
      target_id: id
    })

    if (error) {
      console.error('[Action: restoreUser] Erro:', error.message)
      return { success: false, error: sanitizeError(error) }
    }

    revalidateTag('admin-users')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em restoreUser:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}

export async function anonymizeUser(id: string): Promise<ActionResult> {
  try {
    const auth = await requirePermission('users.manage')
    const supabase = createAdminSupabaseClient()

    // 1. Verificar permissão de organização se não for ADMIN global
    if (auth.role !== 'admin') {
      const { data: user } = await supabase.from('users').select('org_id').eq('id', id).single()
      if (user?.org_id !== auth.orgId) throw new Error('FORBIDDEN')
    }

    await setAuditContext('Processo de Anonimização LGPD (Expurgo de PII e Credenciais)')

    // 2. Anonimizar na tabela pública (Hard Masking + Soft Delete) via RPC
    const { error: rpcError } = await supabase.rpc('anonymize_user', {
      target_user_id: id
    })

    if (rpcError) {
      console.error('[Action: anonymizeUser] Erro no Database:', rpcError.message)
      return { success: false, error: sanitizeError(rpcError) }
    }

    // 3. Expurgar Credenciais no Supabase Auth (Direito ao Esquecimento Definitivo)
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      // Nota: Se o usuário já tiver sido deletado do Auth por algum motivo, ignoramos o erro para não travar a ação
      console.warn('[Action: anonymizeUser] Aviso no Auth:', authError.message)
    }

    revalidateTag('admin-users')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em anonymizeUser:', getErrorMessage(error))
    return { success: false, error: sanitizeError(error) }
  }
}
