import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { deleteLink } from '../services/delete-link.js'

export const deleteLinkRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    '/links/:slug',
    {
      schema: {
        summary: 'Remove um link pelo slug',
        tags: ['links'],
        params: z.object({
          slug: z.string(),
        }),
        response: {
          204: z.null().describe('Link removido'),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      await deleteLink(request.params.slug)

      return reply.status(204).send(null)
    },
  )
}
