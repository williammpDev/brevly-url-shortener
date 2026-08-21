import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { exportLinksReport } from '../services/export-links-report.js'

export const exportLinksReportRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/links/exports',
    {
      // A rota mais cara da API: varre a tabela inteira e escreve no R2. O
      // limite proprio evita que uma chamada em laco vire custo de storage.
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
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
