import Fastify, { type FastifyServerOptions } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { createLinkRoute } from './routes/create-link.js'
import { deleteLinkRoute } from './routes/delete-link.js'
import { getLinkBySlugRoute } from './routes/get-link-by-slug.js'
import { healthRoute } from './routes/health.js'
import { incrementLinkAccessRoute } from './routes/increment-link-access.js'
import { listLinksRoute } from './routes/list-links.js'
import { LinkNotFoundError, SlugAlreadyInUseError } from './services/errors.js'

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

    app.log.error(error)

    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  })

  app.register(healthRoute)
  app.register(createLinkRoute)
  app.register(listLinksRoute)
  app.register(deleteLinkRoute)
  app.register(getLinkBySlugRoute)
  app.register(incrementLinkAccessRoute)

  return app
}
