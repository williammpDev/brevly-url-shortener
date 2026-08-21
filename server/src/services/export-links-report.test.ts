import { beforeEach, describe, expect, it, vi } from 'vitest'
import { exportLinksReport } from './export-links-report.js'

const mocks = vi.hoisted(() => {
  const toSQL = vi.fn(() => ({ sql: 'select slug from links', params: [] }))
  const orderBy = vi.fn(() => ({ toSQL }))
  const from = vi.fn(() => ({ orderBy }))
  const select = vi.fn(() => ({ from }))
  const cursor = vi.fn()
  const unsafe = vi.fn(() => ({ cursor }))

  const enviado: { csv?: string; parametros?: Record<string, unknown> } = {}

  return { toSQL, orderBy, from, select, cursor, unsafe, enviado }
})

vi.mock('../lib/db.js', () => ({
  db: { select: mocks.select },
  pg: { unsafe: mocks.unsafe },
}))

vi.mock('../lib/r2.js', () => ({
  uploadFileToR2: vi.fn(
    async ({
      contentStream,
      ...parametros
    }: {
      contentStream: AsyncIterable<Buffer>
      folder: string
      fileName: string
      contentType: string
    }) => {
      const pedacos: Buffer[] = []
      for await (const pedaco of contentStream) {
        pedacos.push(Buffer.from(pedaco))
      }

      mocks.enviado.csv = Buffer.concat(pedacos).toString('utf8')
      mocks.enviado.parametros = parametros

      return {
        key: 'reports/uuid-links.csv',
        url: 'https://pub-exemplo.r2.dev/reports/uuid-links.csv',
      }
    },
  ),
}))

/**
 * Formato real do cliente cru do postgres-js: colunas em snake_case e o
 * timestamp como **texto** do Postgres, nao como Date. A primeira versao deste
 * teste usava Date, passava, e a exportacao quebrava com 500 contra o banco.
 */
function loteDoBanco() {
  return [
    {
      slug: 'meu-link',
      original_url: 'https://exemplo.com/uma-pagina',
      access_count: 42,
      created_at: '2026-08-21 12:00:00.123456+00',
    },
    {
      slug: 'outro',
      original_url: 'https://exemplo.com/outra',
      access_count: 0,
      created_at: '2026-08-20 09:30:00+00',
    },
  ]
}

function cursorCom(lotes: ReturnType<typeof loteDoBanco>[]) {
  return (async function* () {
    for (const lote of lotes) {
      yield lote
    }
  })()
}

describe('exportLinksReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.enviado.csv = undefined
    mocks.enviado.parametros = undefined
    mocks.cursor.mockReturnValue(cursorCom([loteDoBanco()]))
  })

  it('devolve a URL pública do arquivo gerado', async () => {
    await expect(exportLinksReport()).resolves.toEqual({
      reportUrl: 'https://pub-exemplo.r2.dev/reports/uuid-links.csv',
    })
  })

  /** O requisito de listagem performática do enunciado mora aqui. */
  it('lê o banco por cursor, em lotes, e não com a tabela inteira em memória', async () => {
    await exportLinksReport()

    expect(mocks.unsafe).toHaveBeenCalledWith('select slug from links', [])
    expect(mocks.cursor).toHaveBeenCalledWith(100)
  })

  it('escreve o cabeçalho com as quatro colunas exigidas', async () => {
    await exportLinksReport()

    const [cabecalho] = (mocks.enviado.csv ?? '').split('\n')

    expect(cabecalho).toBe('URL original,URL encurtada,Contagem de acessos,Data de criação')
  })

  it('monta a URL encurtada com a base configurada, e não só o slug', async () => {
    await exportLinksReport()

    const linhas = (mocks.enviado.csv ?? '').trim().split('\n')

    expect(linhas[1]).toBe(
      'https://exemplo.com/uma-pagina,https://brev.ly/meu-link,42,2026-08-21T12:00:00.123Z',
    )
  })

  it('escreve uma linha por link, atravessando todos os lotes do cursor', async () => {
    mocks.cursor.mockReturnValue(cursorCom([loteDoBanco(), loteDoBanco()]))

    await exportLinksReport()

    const linhas = (mocks.enviado.csv ?? '').trim().split('\n')

    expect(linhas).toHaveLength(5)
  })

  it('sobe como text/csv na pasta de relatórios', async () => {
    await exportLinksReport()

    expect(mocks.enviado.parametros).toMatchObject({
      folder: 'reports',
      fileName: 'links.csv',
      contentType: 'text/csv',
    })
  })

  it('também aceita timestamp como Date, se a leitura mudar', async () => {
    mocks.cursor.mockReturnValue(
      cursorCom([
        [
          {
            slug: 'meu-link',
            original_url: 'https://exemplo.com/uma-pagina',
            access_count: 1,
            created_at: new Date('2026-08-21T12:00:00Z'),
          },
        ],
      ]),
    )

    await exportLinksReport()

    const linhasDoCsv = (mocks.enviado.csv ?? '').trim().split('\n')

    expect(linhasDoCsv[1]).toContain('2026-08-21T12:00:00.000Z')
  })

  it('recusa data em formato inesperado em vez de escrever lixo no CSV', async () => {
    mocks.cursor.mockReturnValue(
      cursorCom([
        [
          {
            slug: 'meu-link',
            original_url: 'https://exemplo.com/uma-pagina',
            access_count: 1,
            created_at: 'ontem de manhã',
          },
        ],
      ]),
    )

    await expect(exportLinksReport()).rejects.toThrowError(/formato inesperado/)
  })

  it('gera cabeçalho mesmo sem nenhum link cadastrado', async () => {
    mocks.cursor.mockReturnValue(cursorCom([]))

    await exportLinksReport()

    expect((mocks.enviado.csv ?? '').trim()).toBe(
      'URL original,URL encurtada,Contagem de acessos,Data de criação',
    )
  })
})
