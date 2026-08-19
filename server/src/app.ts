import Fastify, { type FastifyServerOptions } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { createLinkRoute } from './routes/create-link.js'
import { healthRoute } from './routes/health.js'
import { listLinksRoute } from './routes/list-links.js'
import { SlugAlreadyInUseError } from './services/errors.js'

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

    app.log.error(error)

    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  })

  app.register(healthRoute)
  app.register(createLinkRoute)
  app.register(listLinksRoute)

  return app
}
