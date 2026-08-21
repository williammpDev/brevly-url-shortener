import { describe, expect, it } from 'vitest'
import { parseEnv } from './env.js'

const DATABASE_URL = 'postgresql://brevly:brevly@localhost:5432/brevly'

/** O mínimo que o processo precisa para subir. */
const valido = {
  DATABASE_URL,
  CLOUDFLARE_ACCOUNT_ID: '0123456789abcdef0123456789abcdef',
  CLOUDFLARE_ACCESS_KEY_ID: 'chave',
  CLOUDFLARE_SECRET_ACCESS_KEY: 'segredo',
  CLOUDFLARE_BUCKET: 'brevly-reports',
  CLOUDFLARE_PUBLIC_URL: 'https://pub-exemplo.r2.dev',
  SHORT_LINK_BASE_URL: 'https://brev.ly',
}

describe('parseEnv', () => {
  it('aplica os defaults de PORT e NODE_ENV', () => {
    const env = parseEnv(valido)

    expect(env.PORT).toBe(3333)
    expect(env.NODE_ENV).toBe('development')
  })

  it('converte PORT de texto para número', () => {
    expect(parseEnv({ ...valido, PORT: '4000' }).PORT).toBe(4000)
  })

  it('distingue variável ausente de variável malformada', () => {
    expect(() => parseEnv({})).toThrowError(/DATABASE_URL: variável obrigatória ausente/)
    expect(() => parseEnv({ ...valido, DATABASE_URL: 'nao-e-url' })).toThrowError(
      /DATABASE_URL: precisa ser uma URL de conexão válida/,
    )
  })

  it('recusa DATABASE_URL que não seja de Postgres', () => {
    expect(() =>
      parseEnv({ ...valido, DATABASE_URL: 'mysql://brevly@localhost:3306/brevly' }),
    ).toThrowError(/postgresql:\/\//)
  })

  it('recusa NODE_ENV fora dos valores previstos', () => {
    expect(() => parseEnv({ ...valido, NODE_ENV: 'homologacao' })).toThrowError(/NODE_ENV/)
  })

  it('lista todas as variáveis que faltam de uma vez, não só a primeira', () => {
    const erro = (() => {
      try {
        parseEnv({ DATABASE_URL })
        return ''
      } catch (e) {
        return (e as Error).message
      }
    })()

    expect(erro).toMatch(/CLOUDFLARE_ACCOUNT_ID/)
    expect(erro).toMatch(/CLOUDFLARE_BUCKET/)
    expect(erro).toMatch(/CLOUDFLARE_PUBLIC_URL/)
  })

  /**
   * O painel do Cloudflare mostra o endpoint completo ao lado do ID da conta, e
   * colar o endpoint inteiro aqui é erro fácil de cometer: aconteceu de verdade
   * no setup do bucket. Sem esta validação, o cliente monta uma URL duplicada e
   * a falha aparece só na primeira chamada ao R2, com mensagem obscura.
   */
  it('recusa CLOUDFLARE_ACCOUNT_ID com o endpoint completo colado', () => {
    expect(() =>
      parseEnv({
        ...valido,
        CLOUDFLARE_ACCOUNT_ID: 'https://0123456789abcdef0123456789abcdef.r2.cloudflarestorage.com',
      }),
    ).toThrowError(/sem https:\/\//)
  })

  it('recusa CLOUDFLARE_ACCOUNT_ID que não seja 32 hexadecimais', () => {
    expect(() => parseEnv({ ...valido, CLOUDFLARE_ACCOUNT_ID: 'abc123' })).toThrowError(
      /32 caracteres hexadecimais/,
    )
  })

  it('recusa CLOUDFLARE_PUBLIC_URL que não seja URL', () => {
    expect(() => parseEnv({ ...valido, CLOUDFLARE_PUBLIC_URL: 'pub-exemplo' })).toThrowError(
      /CLOUDFLARE_PUBLIC_URL/,
    )
  })
})
