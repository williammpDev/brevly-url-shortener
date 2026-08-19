import { desc } from 'drizzle-orm'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { links } from '../db/schema.js'
import { listLinks } from './list-links.js'

const mocks = vi.hoisted(() => {
  const orderBy = vi.fn()
  const from = vi.fn(() => ({ orderBy }))
  const select = vi.fn(() => ({ from }))

  return { orderBy, from, select }
})

vi.mock('../lib/db.js', () => ({ db: { select: mocks.select } }))

const link = {
  id: '0b8a2f1e-6f0e-4d4a-9f3a-1d2c3b4a5e6f',
  slug: 'meu-link',
  originalUrl: 'https://exemplo.com/pagina',
  accessCount: 3,
  createdAt: new Date('2026-08-18T12:00:00Z'),
}

describe('listLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.orderBy.mockResolvedValue([link])
  })

  it('devolve os links da consulta', async () => {
    await expect(listLinks()).resolves.toEqual([link])
  })

  it('devolve lista vazia quando não há link cadastrado', async () => {
    mocks.orderBy.mockResolvedValue([])

    await expect(listLinks()).resolves.toEqual([])
  })

  it('consulta a tabela de links', async () => {
    await listLinks()

    expect(mocks.from).toHaveBeenCalledWith(links)
  })

  it('ordena do mais recente para o mais antigo', async () => {
    await listLinks()

    expect(mocks.orderBy).toHaveBeenCalledWith(desc(links.createdAt))
  })
})
