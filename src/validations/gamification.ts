import { z } from 'zod'

export const badgeSchema = z.object({
    name: z.string().min(3, "Nome da medalha deve ter pelo menos 3 caracteres"),
    description: z.string().min(10, "Descrição muito curta"),
    icon: z.string(),
    color: z.string(),
    type: z.enum(['achievement', 'culture', 'hard-skill', 'soft-skill', 'peer'])
})

export const awardBadgeSchema = z.object({
    userId: z.string().uuid("ID de usuário inválido"),
    badgeId: z.string().uuid("ID de medalha inválido"),
    comment: z.string().optional()
})
