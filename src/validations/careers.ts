import { z } from 'zod'

/**
 * Schema de validação agressiva para candidatura pública.
 * Sanitiza inputs contra XSS e limita tamanhos para evitar abuse.
 */
export const publicApplicationSchema = z.object({
    job_id: z.string().uuid('ID de vaga inválido.'),
    full_name: z
        .string()
        .trim()
        .min(2, 'Nome deve ter no mínimo 2 caracteres.')
        .max(100, 'Nome deve ter no máximo 100 caracteres.')
        .transform(v => v.replace(/<[^>]*>/g, '')), // Strip HTML tags
    email: z
        .string()
        .email('E-mail inválido.')
        .max(100, 'E-mail deve ter no máximo 100 caracteres.')
        .transform(v => v.toLowerCase().trim()),
    phone: z
        .string()
        .max(20, 'Telefone deve ter no máximo 20 caracteres.')
        .optional()
        .or(z.literal('')),
    linkedin_url: z
        .string()
        .url('URL do LinkedIn inválida.')
        .max(200)
        .optional()
        .or(z.literal('')),
    summary: z
        .string()
        .max(500, 'Resumo deve ter no máximo 500 caracteres.')
        .optional()
        .or(z.literal(''))
        .transform(v => v ? v.replace(/<[^>]*>/g, '') : v), // Strip HTML tags
})

export type PublicApplicationInput = z.infer<typeof publicApplicationSchema>
