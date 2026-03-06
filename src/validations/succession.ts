import { z } from 'zod'

export const successionPlanSchema = z.object({
    userId: z.string().uuid("ID de usuário inválido")
})
