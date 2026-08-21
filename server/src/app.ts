import fastifyCors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import Fastify, { type FastifyServerOptions } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { env } from './lib/env.js'
import { createLinkRoute } from './routes/create-link.js'
import { deleteLinkRoute } from './routes/delete-link.js'
import { exportLinksReportRoute } from './routes/export-links-report.js'
import { getLinkBySlugRoute } from './routes/get-link-by-slug.js'
import { healthRoute } from './routes/health.js'
import { incrementLinkAccessRoute } from './routes/increment-link-access.js'
import { listLinksRoute } from './routes/list-links.js'
import { LinkNotFoundError, SlugAlreadyInUseError } from './services/errors.js'

/**
 * O erro que chega ao handler e `unknown`. Alguns plugins do Fastify trazem
 * status e mensagem proprios — o rate limit responde 429, o parser de JSON
 * responde 400 —, e sem ler esses campos o handler transformaria tudo em 500,
 * escondendo do cliente o que de fato aconteceu.
 */
function lerErroComStatus(error: unknown): { status: number; message: string } | null {
  if (typeof error !== 'object' || error === null) {
    return null
  }

  const status =
    'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : null
  const message = 'message' in error && typeof error.message === 'string' ? error.message : null

  return status !== null && message !== null ? { status, message } : null
}

export function buildApp(options: FastifyServerOptions = { logger: true }) {
  const app = Fastify(options)

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.setErrorHandler((error, _request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        message: 'Dados inválidos na requisição.',
        issues: error.validation,
      })
    }

    if (error instanceof SlugAlreadyInUseError) {
      return reply.status(409).send({ message: error.message })
    }

    if (error instanceof LinkNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    // Erros que ja trazem status proprio — rate limit em 429, JSON malformado
    // em 400, rota inexistente em 404 — sao respondidos como vieram. Sem isto o
    // handler os transformava em 500, escondendo do cliente o que aconteceu.
    const comStatusProprio = lerErroComStatus(error)

    if (comStatusProprio && comStatusProprio.status >= 400 && comStatusProprio.status < 500) {
      return reply.status(comStatusProprio.status).send({ message: comStatusProprio.message })
    }

    app.log.error(error)

    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  })

  // CORS restrito a origem do frontend, que e o unico cliente esperado da API.
  // A origem vem do SHORT_LINK_BASE_URL que ja existe: e o mesmo endereco, e
  // duas variaveis apontando para o mesmo lugar viram fonte de divergencia.
  app.register(fastifyCors, {
    origin: new URL(env.SHORT_LINK_BASE_URL).origin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })

  // Limite global por IP. O incremento de acessos e chamado a cada
  // redirecionamento, entao o teto e alto o suficiente para uso legitimo e
  // baixo o suficiente para atrapalhar quem quiser inflar contador em laco.
  app.register(fastifyRateLimit, {
    max: 200,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      statusCode: 429,
      message: 'Muitas requisições em pouco tempo. Tente de novo em instantes.',
    }),
  })

  // O documento OpenAPI nasce dos mesmos schemas Zod que validam as rotas: um
  // artefato, tres usos — validacao, tipagem e documentacao. Precisa ser
  // registrado antes das rotas para enxerga-las.
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Brev.ly',
        description:
          'API do encurtador de URL: cadastro, listagem, remoção, busca e contagem de acessos.',
        version: '1.0.0',
      },
      tags: [{ name: 'links', description: 'Operações sobre links encurtados' }],
    },
    transform: jsonSchemaTransform,
  })

  app.register(fastifySwaggerUi, { routePrefix: '/docs' })

  app.register(healthRoute)
  app.register(createLinkRoute)
  app.register(listLinksRoute)
  app.register(deleteLinkRoute)
  app.register(getLinkBySlugRoute)
  app.register(incrementLinkAccessRoute)
  app.register(exportLinksReportRoute)

  return app
}
