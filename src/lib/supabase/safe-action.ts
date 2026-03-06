import { z, ZodTypeAny } from 'zod'
import { requirePermission, requireAuth, AuthContext } from './auth'
import { PermissionKey } from '@/types'

/**
 * Wrapper para Server Actions que automatiza segurança, validação e log de erros.
 * Eleva a arquitetura para o padrão 10/10.
 */
export function createSafeAction<T extends ZodTypeAny, R>(
    schema: T,
    handler: (data: z.output<T>, auth: AuthContext) => Promise<R>,
    permission?: PermissionKey
) {
    return async (formData: z.input<T>) => {
        try {
            // 1. Validação de Autenticação/Permissão
            const auth = permission
                ? await requirePermission(permission)
                : await requireAuth()

            // 2. Validação de Dados (Zod)
            const validatedData = schema.parse(formData)

            // 3. Execução do Handler
            const data = await handler(validatedData, auth)

            return { success: true, data }
        } catch (error: unknown) {
            const err = error as any
            console.error('❌ [SafeAction Error]:', err.message)

            // Tratamento amigável de erros conhecidos
            if (error instanceof z.ZodError) {
                return { success: false, error: 'Dados inválidos.', details: error.issues }
            }

            if (err.message === 'FORBIDDEN') {
                return { success: false, error: 'Você não tem permissão para realizar esta ação.' }
            }

            return { success: false, error: err.message || 'Erro inesperado no servidor.' }
        }
    }
}
