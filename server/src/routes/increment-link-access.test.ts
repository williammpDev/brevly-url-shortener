import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from '../app.js'
import { LinkNotFoundError } from '../services/errors.js'

const mocks = vi.hoisted(() => ({ incrementLinkAccess: vi.fn() }))

vi.mock('../services/increment-link-access.js', () => ({
  incrementLinkAccess: mocks.incrementLinkAccess,
}))

async function contar(slug: string) {
  const app = buildApp({ logger: false })
  const response = await app.inject({ method: 'PATCH', url: `/links/${slug}/access-count` })
  await app.close()

  return response
}

describe('PATCH /links/:slug/access-count', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.incrementLinkAccess.mockResolvedValue(undefined)
  })

  it('devolve 204 sem corpo', async () => {
    const response = await contar('meu-link')

    expect(response.statusCode).toBe(204)
    expect(response.body).toBe('')
  })

  it('repassa o slug para o service', async () => {
    await contar('Meu-Link')

    expect(mocks.incrementLinkAccess).toHaveBeenCalledWith('Meu-Link')
  })

  it('devolve 404 quando o link não existe', async () => {
    mocks.incrementLinkAccess.mockRejectedValue(new LinkNotFoundError('nao-existe'))

    const response = await contar('nao-existe')

    expect(response.statusCode).toBe(404)
  })

  it('devolve 500 quando o service falha por outro motivo', async () => {
    mocks.incrementLinkAccess.mockRejectedValue(new Error('banco fora do ar'))

    expect((await contar('meu-link')).statusCode).toBe(500)
  })
})
