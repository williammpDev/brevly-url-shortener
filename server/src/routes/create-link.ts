import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { createLink } from '../services/create-link.js'
import { linkSchema } from './link-schema.js'

/**
 * Letras, números e hífen, sem hífen nas pontas. A validação aceita maiúsculas
 * porque o service normaliza para minúsculas — recusar seria hostil com quem
 * digitou "Meu-Link".
 */
const slugSchema = z
  .string()
  .min(3, 'precisa ter ao menos 3 caracteres')
  .max(60, 'precisa ter no máximo 60 caracteres')
  .regex(
    /^[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?$/,
    'aceita apenas letras, números e hífen, e não pode começar nem terminar com hífen',
  )

export const createLinkRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/links',
    {
      schema: {
        summary: 'Cadastra um link encurtado',
        tags: ['links'],
        body: z.object({
          slug: slugSchema,
          originalUrl: z.url('precisa ser uma URL válida'),
        }),
        response: {
          201: linkSchema,
          400: z.object({
            message: z.string(),
            issues: z.array(z.unknown()).optional(),
          }),
          409: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const link = await createLink(request.body)

      return reply.status(201).send(link)
    },
  )
}
