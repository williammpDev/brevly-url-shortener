import { eq, SQL } from 'drizzle-orm'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { links } from '../db/schema.js'
import { LinkNotFoundError } from './errors.js'
import { incrementLinkAccess } from './increment-link-access.js'

const mocks = vi.hoisted(() => {
  const returning = vi.fn()
  const where = vi.fn(() => ({ returning }))
  const set = vi.fn(() => ({ where }))
  const update = vi.fn(() => ({ set }))

  return { returning, where, set, update }
})

vi.mock('../lib/db.js', () => ({ db: { update: mocks.update } }))

const link = {
  id: '0b8a2f1e-6f0e-4d4a-9f3a-1d2c3b4a5e6f',
  slug: 'meu-link',
  originalUrl: 'https://exemplo.com/pagina',
  accessCount: 8,
  createdAt: new Date('2026-08-20T12:00:00Z'),
}

describe('incrementLinkAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.returning.mockResolvedValue([link])
  })

  it('atualiza a tabela de links pelo slug normalizado', async () => {
    await incrementLinkAccess('  Meu-Link  ')

    expect(mocks.update).toHaveBeenCalledWith(links)
    expect(mocks.where).toHaveBeenCalledWith(eq(links.slug, 'meu-link'))
  })

  /**
   * O teste que importa nesta Issue: se alguém trocar a expressão SQL por um
   * número calculado em JavaScript, dois acessos simultâneos passam a perder
   * contagem. Aqui isso quebra o teste antes de chegar no banco.
   */
  it('soma pelo banco, com expressão SQL, e não com número vindo do JavaScript', async () => {
    await incrementLinkAccess('meu-link')

    const valores = mocks.set.mock.calls[0]?.[0] as { accessCount: unknown }

    expect(valores.accessCount).toBeInstanceOf(SQL)
    expect(typeof valores.accessCount).not.toBe('number')
  })

  it('devolve o link já com o contador atualizado', async () => {
    await expect(incrementLinkAccess('meu-link')).resolves.toEqual(link)
  })

  it('lança LinkNotFoundError quando nada foi atualizado', async () => {
    mocks.returning.mockResolvedValue([])

    await expect(incrementLinkAccess('nao-existe')).rejects.toBeInstanceOf(LinkNotFoundError)
  })
})
