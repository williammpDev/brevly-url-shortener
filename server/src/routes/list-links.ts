import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { listLinks } from '../services/list-links.js'
import { linkSchema } from './link-schema.js'

export const listLinksRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/links',
    {
      schema: {
        summary: 'Lista os links cadastrados',
        tags: ['links'],
        response: {
          200: z.array(linkSchema),
        },
      },
    },
    async (_request, reply) => {
      const links = await listLinks()

      return reply.status(200).send(links)
    },
  )
}
