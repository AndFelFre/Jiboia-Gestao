import { z } from 'zod'

export const brandingSchema = z.object({
    logo_url: z.string().url().optional(),
    primary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida (use Hexadecimal)").optional(),
    timezone: z.string().optional(),
    currency: z.string().length(3).optional()
})
