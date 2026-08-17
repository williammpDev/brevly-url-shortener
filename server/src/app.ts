import Fastify, { type FastifyServerOptions } from 'fastify'
import { healthRoute } from './routes/health.js'

export function buildApp(options: FastifyServerOptions = { logger: true }) {
  const app = Fastify(options)

  app.register(healthRoute)

  return app
}
