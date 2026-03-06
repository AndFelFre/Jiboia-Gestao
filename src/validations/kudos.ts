import { z } from 'zod'

export const sendKudoSchema = z.object({
    receiverId: z.string().uuid({ message: "ID do destinatário inválido." }),
    message: z.string().min(3, "A mensagem deve ter pelo menos 3 caracteres.").max(500, "A mensagem é muito longa."),
    tags: z.array(z.string()).optional().default([])
})

export const getKudosSchema = z.object({
    limit: z.number().int().min(1).max(100).optional().default(20)
})

export const deleteKudoSchema = z.object({
    kudoId: z.string().uuid({ message: "ID do kudo inválido." })
})
