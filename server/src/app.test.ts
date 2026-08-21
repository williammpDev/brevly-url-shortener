import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from './app.js'

const mocks = vi.hoisted(() => ({ exportLinksReport: vi.fn(), listLinks: vi.fn() }))

vi.mock('./services/export-links-report.js', () => ({
  exportLinksReport: mocks.exportLinksReport,
}))
vi.mock('./services/list-links.js', () => ({ listLinks: mocks.listLinks }))

/** A origem configurada no ambiente de teste. */
const ORIGEM_DO_FRONT = 'https://brev.ly'

describe('CORS', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listLinks.mockResolvedValue([])
  })

  it('libera a origem do frontend', async () => {
    const app = buildApp({ logger: false })
    const response = await app.inject({
      method: 'GET',
      url: '/links',
      headers: { origin: ORIGEM_DO_FRONT },
    })
    await app.close()

    expect(response.headers['access-control-allow-origin']).toBe(ORIGEM_DO_FRONT)
  })

  /**
   * Com uma origem fixa, o @fastify/cors devolve sempre a origem configurada, e
   * quem barra e o navegador ao comparar com a origem que pediu. O que precisa
   * ser garantido aqui e que a resposta nunca ecoa a origem do solicitante.
   */
  it('nunca ecoa a origem de quem pediu, se ela nao for a do frontend', async () => {
    const app = buildApp({ logger: false })
    const response = await app.inject({
      method: 'GET',
      url: '/links',
      headers: { origin: 'https://site-qualquer.com' },
    })
    await app.close()

    expect(response.headers['access-control-allow-origin']).not.toBe('https://site-qualquer.com')
    expect(response.headers['access-control-allow-origin']).toBe(ORIGEM_DO_FRONT)
  })

  it('responde ao preflight da origem do frontend', async () => {
    const app = buildApp({ logger: false })
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/links',
      headers: {
        origin: ORIGEM_DO_FRONT,
        'access-control-request-method': 'POST',
      },
    })
    await app.close()

    expect(response.statusCode).toBeLessThan(300)
    expect(response.headers['access-control-allow-methods']).toContain('POST')
  })
})

describe('rate limit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listLinks.mockResolvedValue([])
    mocks.exportLinksReport.mockResolvedValue({ reportUrl: 'https://pub-exemplo.r2.dev/x.csv' })
  })

  it('anuncia o limite nos cabeçalhos da resposta', async () => {
    const app = buildApp({ logger: false })
    const response = await app.inject({ method: 'GET', url: '/links' })
    await app.close()

    expect(response.headers['x-ratelimit-limit']).toBeDefined()
  })

  /** A exportação varre a tabela e escreve no R2: tem teto próprio, mais baixo. */
  it('devolve 429 na décima primeira exportação dentro da mesma janela', async () => {
    const app = buildApp({ logger: false })

    const respostas = []
    for (let tentativa = 0; tentativa < 11; tentativa += 1) {
      respostas.push(await app.inject({ method: 'POST', url: '/links/exports' }))
    }

    await app.close()

    expect(respostas.slice(0, 10).every((r) => r.statusCode === 200)).toBe(true)
    expect(respostas[10].statusCode).toBe(429)
    expect(respostas[10].json().message).toMatch(/Muitas requisições/)
  })

  it('responde 400, e não 500, quando o corpo não é JSON válido', async () => {
    const app = buildApp({ logger: false })
    const response = await app.inject({
      method: 'POST',
      url: '/links',
      headers: { 'content-type': 'application/json' },
      payload: '{isso nao e json',
    })
    await app.close()

    expect(response.statusCode).toBe(400)
  })

  it('o limite da exportação não derruba as outras rotas', async () => {
    const app = buildApp({ logger: false })

    for (let tentativa = 0; tentativa < 11; tentativa += 1) {
      await app.inject({ method: 'POST', url: '/links/exports' })
    }

    const listagem = await app.inject({ method: 'GET', url: '/links' })
    await app.close()

    expect(listagem.statusCode).toBe(200)
  })
})
