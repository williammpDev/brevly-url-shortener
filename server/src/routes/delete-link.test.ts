import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from '../app.js'
import { LinkNotFoundError } from '../services/errors.js'

const mocks = vi.hoisted(() => ({ deleteLink: vi.fn() }))

vi.mock('../services/delete-link.js', () => ({ deleteLink: mocks.deleteLink }))

async function remover(slug: string) {
  const app = buildApp({ logger: false })
  const response = await app.inject({ method: 'DELETE', url: `/links/${slug}` })
  await app.close()

  return response
}

describe('DELETE /links/:slug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.deleteLink.mockResolvedValue(undefined)
  })

  it('devolve 204 sem corpo quando remove', async () => {
    const response = await remover('meu-link')

    expect(response.statusCode).toBe(204)
    expect(response.body).toBe('')
  })

  it('repassa o slug para o service', async () => {
    await remover('Meu-Link')

    expect(mocks.deleteLink).toHaveBeenCalledWith('Meu-Link')
  })

  it('devolve 404 quando o link não existe', async () => {
    mocks.deleteLink.mockRejectedValue(new LinkNotFoundError('nao-existe'))

    const response = await remover('nao-existe')

    expect(response.statusCode).toBe(404)
    expect(response.json().message).toMatch(/Nenhum link cadastrado/)
  })

  it('devolve 500 quando o service falha por outro motivo', async () => {
    mocks.deleteLink.mockRejectedValue(new Error('banco fora do ar'))

    const response = await remover('meu-link')

    expect(response.statusCode).toBe(500)
  })
})
