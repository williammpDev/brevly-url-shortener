import { describe, expect, it } from 'vitest'
import { parseEnv } from './env.js'

const DATABASE_URL = 'postgresql://brevly:brevly@localhost:5432/brevly'

describe('parseEnv', () => {
  it('aplica os defaults de PORT e NODE_ENV', () => {
    const env = parseEnv({ DATABASE_URL })

    expect(env.PORT).toBe(3333)
    expect(env.NODE_ENV).toBe('development')
  })

  it('converte PORT de texto para número', () => {
    const env = parseEnv({ DATABASE_URL, PORT: '4000' })

    expect(env.PORT).toBe(4000)
  })

  it('distingue variável ausente de variável malformada', () => {
    expect(() => parseEnv({})).toThrowError(/DATABASE_URL: variável obrigatória ausente/)
    expect(() => parseEnv({ DATABASE_URL: 'nao-e-url' })).toThrowError(
      /DATABASE_URL: precisa ser uma URL de conexão válida/,
    )
  })

  it('recusa DATABASE_URL que não seja de Postgres', () => {
    expect(() => parseEnv({ DATABASE_URL: 'mysql://brevly@localhost:3306/brevly' })).toThrowError(
      /postgresql:\/\//,
    )
  })

  it('recusa NODE_ENV fora dos valores previstos', () => {
    expect(() => parseEnv({ DATABASE_URL, NODE_ENV: 'homologacao' })).toThrowError(/NODE_ENV/)
  })
})
