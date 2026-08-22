import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SlugAlreadyInUseError } from '../services/errors.js'
import { sharedTestApp } from '../test/shared-app.js'

const mocks = vi.hoisted(() => ({ createLink: vi.fn() }))

vi.mock('../services/create-link.js', () => ({ createLink: mocks.createLink }))

const linkCriado = {
  id: '0b8a2f1e-6f0e-4d4a-9f3a-1d2c3b4a5e6f',
  slug: 'meu-link',
  originalUrl: 'https://exemplo.com/pagina',
  accessCount: 0,
  createdAt: new Date('2026-08-18T12:00:00Z'),
}

const app = sharedTestApp()

async function cadastrar(body: unknown) {
  return app.inject({ method: 'POST', url: '/links', payload: body })
}

describe('POST /links', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createLink.mockResolvedValue(linkCriado)
  })

  it('devolve 201 com o link criado', async () => {
    const response = await cadastrar({
      slug: 'meu-link',
      originalUrl: 'https://exemplo.com/pagina',
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      slug: 'meu-link',
      originalUrl: 'https://exemplo.com/pagina',
      accessCount: 0,
    })
  })

  it('devolve 409 quando o service acusa slug em uso', async () => {
    mocks.createLink.mockRejectedValue(new SlugAlreadyInUseError('meu-link'))

    const response = await cadastrar({
      slug: 'meu-link',
      originalUrl: 'https://exemplo.com/pagina',
    })

    expect(response.statusCode).toBe(409)
    expect(response.json().message).toMatch(/já está em uso/)
  })

  it('recusa URL inválida com 400', async () => {
    const response = await cadastrar({ slug: 'meu-link', originalUrl: 'nao-e-url' })

    expect(response.statusCode).toBe(400)
    expect(mocks.createLink).not.toHaveBeenCalled()
  })

  it('recusa slug com caractere fora do permitido', async () => {
    const response = await cadastrar({
      slug: 'meu link!',
      originalUrl: 'https://exemplo.com/pagina',
    })

    expect(response.statusCode).toBe(400)
    expect(mocks.createLink).not.toHaveBeenCalled()
  })

  it('recusa slug com hífen na ponta', async () => {
    const response = await cadastrar({
      slug: '-meu-link',
      originalUrl: 'https://exemplo.com/pagina',
    })

    expect(response.statusCode).toBe(400)
  })

  it('recusa slug curto demais', async () => {
    const response = await cadastrar({ slug: 'ab', originalUrl: 'https://exemplo.com/pagina' })

    expect(response.statusCode).toBe(400)
  })

  it('aceita slug com maiúsculas e deixa a normalização para o service', async () => {
    const response = await cadastrar({
      slug: 'Meu-Link',
      originalUrl: 'https://exemplo.com/pagina',
    })

    expect(response.statusCode).toBe(201)
    expect(mocks.createLink).toHaveBeenCalledWith({
      slug: 'Meu-Link',
      originalUrl: 'https://exemplo.com/pagina',
    })
  })
})
