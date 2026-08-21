import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { links } from '../db/schema.js'
import { LinkNotFoundError } from './errors.js'
import { getLinkBySlug } from './get-link-by-slug.js'

const mocks = vi.hoisted(() => {
  const limit = vi.fn()
  const where = vi.fn(() => ({ limit }))
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))

  return { limit, where, from, select }
})

vi.mock('../lib/db.js', () => ({ db: { select: mocks.select } }))

const link = {
  id: '0b8a2f1e-6f0e-4d4a-9f3a-1d2c3b4a5e6f',
  slug: 'meu-link',
  originalUrl: 'https://exemplo.com/pagina',
  accessCount: 7,
  createdAt: new Date('2026-08-20T12:00:00Z'),
}

describe('getLinkBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.limit.mockResolvedValue([link])
  })

  it('devolve o link encontrado', async () => {
    await expect(getLinkBySlug('meu-link')).resolves.toEqual(link)
    expect(mocks.from).toHaveBeenCalledWith(links)
    expect(mocks.where).toHaveBeenCalledWith(eq(links.slug, 'meu-link'))
  })

  it('normaliza o slug antes de procurar', async () => {
    await getLinkBySlug('  Meu-Link  ')

    expect(mocks.where).toHaveBeenCalledWith(eq(links.slug, 'meu-link'))
  })

  it('não altera nada no banco: só consulta', async () => {
    await getLinkBySlug('meu-link')

    expect(mocks.select).toHaveBeenCalledOnce()
  })

  it('lança LinkNotFoundError quando o slug não existe', async () => {
    mocks.limit.mockResolvedValue([])

    await expect(getLinkBySlug('nao-existe')).rejects.toBeInstanceOf(LinkNotFoundError)
  })
})
