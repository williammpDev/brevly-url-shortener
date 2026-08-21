import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getLinkBySlug } from '../services/get-link-by-slug.js'
import { linkSchema } from './link-schema.js'

export const getLinkBySlugRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/links/:slug',
    {
      schema: {
        summary: 'Busca um link pelo slug, sem contar acesso',
        tags: ['links'],
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: linkSchema,
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const link = await getLinkBySlug(request.params.slug)

      return reply.status(200).send(link)
    },
  )
}
