import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from '../app.js'
import { LinkNotFoundError } from '../services/errors.js'

const mocks = vi.hoisted(() => ({ getLinkBySlug: vi.fn() }))

vi.mock('../services/get-link-by-slug.js', () => ({ getLinkBySlug: mocks.getLinkBySlug }))

const link = {
  id: '0b8a2f1e-6f0e-4d4a-9f3a-1d2c3b4a5e6f',
  slug: 'meu-link',
  originalUrl: 'https://exemplo.com/pagina',
  accessCount: 7,
  createdAt: new Date('2026-08-20T12:00:00Z'),
}

async function buscar(slug: string) {
  const app = buildApp({ logger: false })
  const response = await app.inject({ method: 'GET', url: `/links/${slug}` })
  await app.close()

  return response
}

describe('GET /links/:slug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getLinkBySlug.mockResolvedValue(link)
  })

  it('devolve 200 com o link, incluindo a URL original', async () => {
    const response = await buscar('meu-link')

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      slug: 'meu-link',
      originalUrl: 'https://exemplo.com/pagina',
      accessCount: 7,
    })
  })

  it('não confunde com a listagem: a rota sem slug continua devolvendo array', async () => {
    const app = buildApp({ logger: false })
    const response = await app.inject({ method: 'GET', url: '/links/meu-link' })
    await app.close()

    expect(Array.isArray(response.json())).toBe(false)
  })

  it('devolve 404 quando o slug não existe', async () => {
    mocks.getLinkBySlug.mockRejectedValue(new LinkNotFoundError('nao-existe'))

    const response = await buscar('nao-existe')

    expect(response.statusCode).toBe(404)
    expect(response.json().message).toMatch(/Nenhum link cadastrado/)
  })

  it('devolve 500 quando o service falha por outro motivo', async () => {
    mocks.getLinkBySlug.mockRejectedValue(new Error('banco fora do ar'))

    expect((await buscar('meu-link')).statusCode).toBe(500)
  })
})
