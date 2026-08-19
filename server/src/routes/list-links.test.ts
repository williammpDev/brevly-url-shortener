import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from '../app.js'

const mocks = vi.hoisted(() => ({ listLinks: vi.fn() }))

vi.mock('../services/list-links.js', () => ({ listLinks: mocks.listLinks }))

const link = {
  id: '0b8a2f1e-6f0e-4d4a-9f3a-1d2c3b4a5e6f',
  slug: 'meu-link',
  originalUrl: 'https://exemplo.com/pagina',
  accessCount: 3,
  createdAt: new Date('2026-08-18T12:00:00Z'),
}

async function listar() {
  const app = buildApp({ logger: false })
  const response = await app.inject({ method: 'GET', url: '/links' })
  await app.close()

  return response
}

describe('GET /links', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listLinks.mockResolvedValue([link])
  })

  it('devolve 200 com a lista de links', async () => {
    const response = await listar()

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveLength(1)
    expect(response.json()[0]).toMatchObject({
      slug: 'meu-link',
      originalUrl: 'https://exemplo.com/pagina',
      accessCount: 3,
    })
  })

  it('devolve array vazio, e não erro, quando não há link', async () => {
    mocks.listLinks.mockResolvedValue([])

    const response = await listar()

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([])
  })

  it('serializa a data de criação em texto ISO', async () => {
    const response = await listar()

    expect(response.json()[0].createdAt).toBe('2026-08-18T12:00:00.000Z')
  })

  it('devolve 500 quando o service falha', async () => {
    mocks.listLinks.mockRejectedValue(new Error('banco fora do ar'))

    const response = await listar()

    expect(response.statusCode).toBe(500)
    expect(response.json().message).toBe('Erro interno do servidor.')
  })
})
