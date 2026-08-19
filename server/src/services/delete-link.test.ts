import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { links } from '../db/schema.js'
import { deleteLink } from './delete-link.js'
import { LinkNotFoundError } from './errors.js'

const mocks = vi.hoisted(() => {
  const returning = vi.fn()
  const where = vi.fn(() => ({ returning }))
  const deleteFrom = vi.fn(() => ({ where }))

  return { returning, where, deleteFrom }
})

vi.mock('../lib/db.js', () => ({ db: { delete: mocks.deleteFrom } }))

const link = {
  id: '0b8a2f1e-6f0e-4d4a-9f3a-1d2c3b4a5e6f',
  slug: 'meu-link',
  originalUrl: 'https://exemplo.com/pagina',
  accessCount: 0,
  createdAt: new Date('2026-08-19T12:00:00Z'),
}

describe('deleteLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.returning.mockResolvedValue([link])
  })

  it('remove o link pelo slug', async () => {
    await expect(deleteLink('meu-link')).resolves.toBeUndefined()

    expect(mocks.deleteFrom).toHaveBeenCalledWith(links)
    expect(mocks.where).toHaveBeenCalledWith(eq(links.slug, 'meu-link'))
  })

  it('normaliza o slug antes de procurar, como o cadastro faz', async () => {
    await deleteLink('  Meu-Link  ')

    expect(mocks.where).toHaveBeenCalledWith(eq(links.slug, 'meu-link'))
  })

  it('lança LinkNotFoundError quando nada foi removido', async () => {
    mocks.returning.mockResolvedValue([])

    await expect(deleteLink('nao-existe')).rejects.toBeInstanceOf(LinkNotFoundError)
  })

  it('cita o slug procurado na mensagem do erro', async () => {
    mocks.returning.mockResolvedValue([])

    await expect(deleteLink('Nao-Existe')).rejects.toThrowError(/"nao-existe"/)
  })

  it('não engole falha do banco', async () => {
    mocks.returning.mockRejectedValue(new Error('conexão com o banco caiu'))

    await expect(deleteLink('meu-link')).rejects.toThrowError('conexão com o banco caiu')
  })
})
