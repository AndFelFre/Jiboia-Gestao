import { createServerSupabaseClient } from './server'
import { createAdminSupabaseClient } from './admin'
import { PermissionKey, UserRole } from '@/types'

export interface AuthContext {
  userId: string
  orgId: string
  unitId: string | null
  role: UserRole
  status: 'active' | 'inactive' | 'pending'
}

/**
 * Verifica autenticação e retorna contexto do usuário
 * @throws Error se não autenticado ou usuário não encontrado
 */
export async function requireAuth(): Promise<AuthContext> {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('UNAUTHORIZED')
  }

  // Busca dados do usuário com role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, org_id, unit_id, status, role:roles(name)')
    .eq('id', user.id)
    .maybeSingle()

  if (userError || !userData) {
    if (userError) {
      console.error(`❌ [requireAuth] Erro ao buscar perfil do usuário ${user.id}:`, userError.message)
    } else {
      console.warn(`⚠️ [requireAuth] Usuário ${user.id} está no Auth mas não no banco (public.users)`)
    }
    throw new Error('USER_NOT_FOUND')
  }

  if (userData.status !== 'active') {
    console.warn(`🚫 [requireAuth] Usuário ${user.id} está inativo (status: ${userData.status})`)
    throw new Error('ACCOUNT_INACTIVE')
  }

  // O relacionamento retorna um objeto ou array, tratamos ambos
  const roleData = userData.role as { name: string } | { name: string }[] | null
  const roleName = Array.isArray(roleData)
    ? (roleData.length > 0 ? roleData[0].name : null)
    : (roleData?.name || null)

  if (!roleName) {
    console.warn(`🚫 [requireAuth] Usuário ${user.id} não possui role vinculada no banco`)
    throw new Error('ROLE_NOT_FOUND')
  }

  return {
    userId: userData.id,
    orgId: userData.org_id,
    unitId: userData.unit_id,
    role: roleName as UserRole,
    status: userData.status as 'active' | 'inactive' | 'pending',
  }
}

/**
 * Mapeamento centralizado de Permissão -> Roles
 * Toda nova permissão deve ser registrada aqui
 */
const PERMISSION_ROLES: Record<PermissionKey, UserRole[]> = {
  'org.manage': ['admin'],
  'unit.manage': ['admin', 'leader'],
  'users.manage': ['admin', 'leader'],
  'roles.manage': ['admin'],
  'recruitment.manage': ['admin', 'leader', 'recruiter'],
  'onboarding.manage': ['admin', 'leader'],
  'offboarding.manage': ['admin', 'leader'],
  'documents.manage': ['admin', 'leader', 'employee', 'recruiter'],
  'requests.manage': ['admin', 'leader', 'employee'],
  'pdi.manage': ['admin', 'leader', 'employee'],
  'feedback.manage': ['admin', 'leader', 'employee'],
  'performance.evaluate': ['admin', 'leader'],
  'audit.read': ['admin'],
  'candidates.manage': ['admin', 'leader', 'recruiter'],
  'interviews.manage': ['admin', 'leader', 'recruiter'],
  'skills.manage': ['admin'],
  'jobs.manage': ['admin', 'leader', 'recruiter'],
}

/**
 * Verifica se o usuário tem permissão específica
 */
export async function requirePermission(permission: PermissionKey): Promise<AuthContext> {
  const auth = await requireAuth()

  const allowedRoles = PERMISSION_ROLES[permission]

  if (!allowedRoles || !allowedRoles.includes(auth.role)) {
    console.warn(`Acesso negado: usuário ${auth.userId} [${auth.role}] tentando: ${permission}`)
    throw new Error('FORBIDDEN')
  }

  return auth
}

/**
 * Garante que a operação ocorra dentro da mesma organização
 */
export async function requireOrgAccess(targetOrgId: string): Promise<AuthContext> {
  const auth = await requireAuth()

  if (auth.role !== 'admin' && auth.orgId !== targetOrgId) {
    console.warn(`Acesso inter-tenant bloqueado: ${auth.userId} [${auth.orgId}] -> target [${targetOrgId}]`)
    throw new Error('FORBIDDEN')
  }

  return auth
}

/**
 * Valida se um ID de recurso pertence à organização do usuário autenticado
 */
export async function validateOrgOwnership(
  tableName: string,
  recordId: string,
  auth: AuthContext
): Promise<void> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from(tableName)
    .select('org_id')
    .eq('id', recordId)
    .single()

  if (error || !data || data.org_id !== auth.orgId) {
    console.warn(`🛑 Tentativa de acesso não autorizado: User ${auth.userId} [${auth.orgId}] -> Table ${tableName} [ID: ${recordId}]`)
    throw new Error('RECURSO_NAO_ENCONTRADO_OU_ACESSO_NEGADO')
  }
}

export { createServerSupabaseClient, createAdminSupabaseClient }
