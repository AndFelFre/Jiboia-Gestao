import { z } from 'zod'

export const aiQuestionSchema = z.object({
    question: z.string().min(3, "A pergunta deve ter pelo least 3 caracteres").max(200, "Pergunta muito longa")
})
