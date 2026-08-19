import { z } from 'zod'

/**
 * Como um link aparece na API. Fica em arquivo próprio porque cadastro e
 * listagem devolvem o mesmo recurso: dois schemas separados divergiriam com o
 * tempo, e divergência entre POST e GET é bug de contrato, não estilo.
 */
export const linkSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  originalUrl: z.string(),
  accessCount: z.number().int(),
  createdAt: z.date(),
})
