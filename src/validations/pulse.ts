import { z } from 'zod'

export const submitPulseSchema = z.object({
    surveyId: z.string().uuid({ message: "ID da pesquisa inválido." }),
    score: z.number().int().min(1).max(5)
})

export const getPulseSchema = z.object({
    activeOnly: z.boolean().optional().default(true)
})
