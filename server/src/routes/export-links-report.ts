import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { exportLinksReport } from '../services/export-links-report.js'

export const exportLinksReportRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/links/exports',
    {
      schema: {
        summary: 'Gera o relatório de links em CSV e devolve a URL do arquivo',
        tags: ['links'],
        response: {
          200: z.object({
            reportUrl: z.url().describe('URL pública do CSV no R2'),
          }),
        },
      },
    },
    async (_request, reply) => {
      const { reportUrl } = await exportLinksReport()

      return reply.status(200).send({ reportUrl })
    },
  )
}
