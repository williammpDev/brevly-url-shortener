import { Readable } from 'node:stream'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { uploadFileToR2 } from './r2.js'

const mocks = vi.hoisted(() => ({
  done: vi.fn(),
  construtor: vi.fn(),
}))

vi.mock('@aws-sdk/lib-storage', () => ({
  Upload: class {
    constructor(params: unknown) {
      mocks.construtor(params)
    }
    done = mocks.done
  },
}))

function streamDeTeste() {
  return Readable.from(['slug,acessos\nmeu-link,3\n'])
}

function parametrosDoUpload() {
  return mocks.construtor.mock.calls[0]?.[0] as {
    params: { Bucket: string; Key: string; ContentType: string; Body: unknown }
  }
}

describe('uploadFileToR2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.done.mockResolvedValue(undefined)
  })

  it('devolve a URL pública montada a partir da chave', async () => {
    const { key, url } = await uploadFileToR2({
      folder: 'reports',
      fileName: 'links.csv',
      contentType: 'text/csv',
      contentStream: streamDeTeste(),
    })

    expect(url).toBe(`https://pub-exemplo.r2.dev/${key}`)
  })

  it('gera nome aleatório e único, como o enunciado exige', async () => {
    const primeiro = await uploadFileToR2({
      folder: 'reports',
      fileName: 'links.csv',
      contentType: 'text/csv',
      contentStream: streamDeTeste(),
    })
    const segundo = await uploadFileToR2({
      folder: 'reports',
      fileName: 'links.csv',
      contentType: 'text/csv',
      contentStream: streamDeTeste(),
    })

    expect(primeiro.key).not.toBe(segundo.key)
    expect(primeiro.key).toMatch(/^reports\/[0-9a-f-]{36}-links\.csv$/)
  })

  it('sanitiza o nome do arquivo, que vira parte de uma URL pública', async () => {
    const { key } = await uploadFileToR2({
      folder: 'reports',
      fileName: 'relatório de links (final).csv',
      contentType: 'text/csv',
      contentStream: streamDeTeste(),
    })

    expect(key).toMatch(/^reports\/[0-9a-f-]{36}-relatriodelinksfinal\.csv$/)
  })

  it('envia para o bucket configurado, com o content-type informado', async () => {
    await uploadFileToR2({
      folder: 'reports',
      fileName: 'links.csv',
      contentType: 'text/csv',
      contentStream: streamDeTeste(),
    })

    const { params } = parametrosDoUpload()

    expect(params.Bucket).toBe('bucket-de-teste')
    expect(params.ContentType).toBe('text/csv')
  })

  /** O Upload do lib-storage é o que aceita stream sem saber o tamanho antes. */
  it('entrega o stream ao SDK, sem carregar o conteúdo em memória', async () => {
    await uploadFileToR2({
      folder: 'reports',
      fileName: 'links.csv',
      contentType: 'text/csv',
      contentStream: streamDeTeste(),
    })

    const { params } = parametrosDoUpload()

    expect(params.Body).toBeInstanceOf(Readable)
  })
})
