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

const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
  return 'https://jiboia-gestao.vercel.app';
};

const redirectTo = `${getSiteUrl()}/auth/callback?next=/auth/setup-password`;

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
  let authUserId: string | null = null
  const supabase = createAdminSupabaseClient()

  try {
    const auth = await requirePermission('users.manage')

    if (auth.role !== 'admin' && formData.org_id !== auth.orgId) {
      throw new Error('FORBIDDEN')
    }

    const { org_id, ...userInput } = formData
    const validated = userSchema.parse(userInput)

    // 1. Enviar convite via Supabase Auth (Magic Link)
    // Supabase gerencia o e-mail e o status 'invited' automaticamente
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
      validated.email,
      {
        data: { full_name: validated.full_name },
        redirectTo,
      }
    )

    if (authError) {
      console.error('[Action: inviteUser] Erro no Auth do Supabase:', authError.message)
      return { success: false, error: authError.message }
    }

    authUserId = authData.user.id

    // 2. Criar perfil na tabela pública
    const userData = {
      id: authUserId,
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
      // ROLLBACK: Se o banco de dados falhar, removemos o usuário do Auth
      console.error('[Action: inviteUser] Erro no banco de dados. Executando Rollback...', dbError.message)
      await supabase.auth.admin.deleteUser(authUserId)
      return { success: false, error: sanitizeError(dbError) }
    }

    await logAudit({
      tableName: 'users',
      recordId: authUserId,
      action: 'INSERT',
      newValues: userData,
    })

    revalidateTag('admin-users')
    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em inviteUser:', getErrorMessage(error))
    // Fallback de segurança: se capturamos erro e temos um authUserId, tentamos limpar
    if (authUserId) {
      await supabase.auth.admin.deleteUser(authUserId).catch(e => console.error('Erro no fallback do rollback:', e))
    }
    return { success: false, error: sanitizeError(error) }
  }
}

/**
 * Reenvia o e-mail de convite (Magic Link) para um usuário pendente.
 */
export async function resendInvite(userId: string): Promise<ActionResult> {
  try {
    const auth = await requirePermission('users.manage')
    const supabase = createAdminSupabaseClient()

    // 1. Buscar e-mail e org do usuário para validação
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('email, org_id, status')
      .eq('id', userId)
      .single()

    if (findError || !user) throw new Error('Usuário não encontrado.')
    if (user.status !== 'pending') throw new Error('Apenas usuários pendentes podem receber reenvio de convite.')

    // 2. Validar permissão de organização
    if (auth.role !== 'admin' && user.org_id !== auth.orgId) {
      throw new Error('FORBIDDEN')
    }

    // 3. Chamar novamente o inviteUserByEmail (reenvia o Magic Link)
    const { error: resendError } = await supabase.auth.admin.inviteUserByEmail(user.email, { redirectTo })

    if (resendError) {
      console.error('[Action: resendInvite] Erro no Supabase:', resendError.message)
      return { success: false, error: resendError.message }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('Erro em resendInvite:', getErrorMessage(error))
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
