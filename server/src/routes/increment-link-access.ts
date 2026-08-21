import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { incrementLinkAccess } from '../services/increment-link-access.js'

export const incrementLinkAccessRoute: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    '/links/:slug/access-count',
    {
      schema: {
        summary: 'Soma 1 ao contador de acessos do link',
        tags: ['links'],
        params: z.object({
          slug: z.string(),
        }),
        response: {
          204: z.null().describe('Acesso contabilizado'),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      await incrementLinkAccess(request.params.slug)

      return reply.status(204).send(null)
    },
  )
}
