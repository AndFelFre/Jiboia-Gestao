import { z } from 'zod'

export const funnelActivitySchema = z.object({
    name: z.string().min(2, "O nome da atividade deve ter no mínimo 2 caracteres"),
    is_active: z.boolean().optional().default(true),
    sequence: z.number().int().optional().default(0)
})

export const funnelInputSchema = z.object({
    activity_id: z.string().uuid(),
    input_date: z.string(), // YYYY-MM-DD
    amount: z.number().int().min(0)
})

export const getFunnelSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional()
})
