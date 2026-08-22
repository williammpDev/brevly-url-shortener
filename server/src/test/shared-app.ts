import type { InjectOptions } from 'fastify'
import { afterAll, beforeAll } from 'vitest'
import { buildApp } from '../app.js'

/**
 * Sobe a aplicação uma vez por arquivo de teste, em vez de uma vez por teste.
 *
 * O boot carrega Fastify, Zod e Swagger e custa alguns segundos; repetir isso a
 * cada `it` fazia a suíte levar 42s. Os mocks continuam sendo por teste, que é o
 * isolamento que importa aqui — nenhuma rota guarda estado entre chamadas.
 *
 * Não serve para teste de rate limit: ali o contador é justamente o estado que
 * precisa nascer limpo a cada caso.
 *
 * O nome evita o prefixo `use` de propósito: o Biome trata função com esse
 * prefixo como React hook e reprova a chamada fora de um componente.
 */
export function sharedTestApp() {
  let app: ReturnType<typeof buildApp>

  beforeAll(async () => {
    app = buildApp({ logger: false })
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  return {
    inject: (options: InjectOptions) => app.inject(options),
  }
}
