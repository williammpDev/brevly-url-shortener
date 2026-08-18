import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createLink } from './create-link.js'
import { SlugAlreadyInUseError } from './errors.js'

const mocks = vi.hoisted(() => {
  const returning = vi.fn()
  const values = vi.fn(() => ({ returning }))
  const insert = vi.fn(() => ({ values }))

  return { returning, values, insert }
})

vi.mock('../lib/db.js', () => ({ db: { insert: mocks.insert } }))

const linkCriado = {
  id: '0b8a2f1e-6f0e-4d4a-9f3a-1d2c3b4a5e6f',
  slug: 'meu-link',
  originalUrl: 'https://exemplo.com/pagina',
  accessCount: 0,
  createdAt: new Date('2026-08-18T12:00:00Z'),
}

/**
 * Forma real do erro: o Drizzle embrulha a falha num DrizzleQueryError e deixa
 * o PostgresError, com o code 23505, em `cause`. A primeira versão deste teste
 * usava o code na raiz, passava, e o conflito virava 500 contra o banco real.
 */
function erroDeUnicidadeComoODrizzleEntrega() {
  const doPostgres = Object.assign(new Error('duplicate key value violates unique constraint'), {
    code: '23505',
  })

  return Object.assign(new Error('Failed query: insert into "links"'), { cause: doPostgres })
}

describe('createLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.returning.mockResolvedValue([linkCriado])
  })

  it('normaliza o slug para minúsculas antes de gravar', async () => {
    await createLink({ slug: 'Meu-Link', originalUrl: 'https://exemplo.com/pagina' })

    expect(mocks.values).toHaveBeenCalledWith({
      slug: 'meu-link',
      originalUrl: 'https://exemplo.com/pagina',
    })
  })

  it('remove espaços nas pontas do slug', async () => {
    await createLink({ slug: '  meu-link  ', originalUrl: 'https://exemplo.com/pagina' })

    expect(mocks.values).toHaveBeenCalledWith({
      slug: 'meu-link',
      originalUrl: 'https://exemplo.com/pagina',
    })
  })

  it('devolve o link criado', async () => {
    const link = await createLink({ slug: 'meu-link', originalUrl: 'https://exemplo.com/pagina' })

    expect(link).toEqual(linkCriado)
  })

  it('traduz violação de unicidade em SlugAlreadyInUseError', async () => {
    mocks.returning.mockRejectedValue(erroDeUnicidadeComoODrizzleEntrega())

    await expect(
      createLink({ slug: 'Repetido', originalUrl: 'https://exemplo.com/pagina' }),
    ).rejects.toBeInstanceOf(SlugAlreadyInUseError)
  })

  it('reconhece a violação mesmo se vier sem embrulho', async () => {
    mocks.returning.mockRejectedValue(Object.assign(new Error('duplicate key'), { code: '23505' }))

    await expect(
      createLink({ slug: 'repetido', originalUrl: 'https://exemplo.com/pagina' }),
    ).rejects.toBeInstanceOf(SlugAlreadyInUseError)
  })

  it('cita o slug normalizado na mensagem do erro de conflito', async () => {
    mocks.returning.mockRejectedValue(erroDeUnicidadeComoODrizzleEntrega())

    await expect(
      createLink({ slug: 'Repetido', originalUrl: 'https://exemplo.com/pagina' }),
    ).rejects.toThrowError(/"repetido"/)
  })

  it('não engole erro que não seja de unicidade', async () => {
    mocks.returning.mockRejectedValue(new Error('conexão com o banco caiu'))

    await expect(
      createLink({ slug: 'meu-link', originalUrl: 'https://exemplo.com/pagina' }),
    ).rejects.toThrowError('conexão com o banco caiu')
  })
})
