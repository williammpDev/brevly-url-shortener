import { PassThrough, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { stringify } from 'csv-stringify'
import { desc } from 'drizzle-orm'
import { links } from '../db/schema.js'
import { db, pg } from '../lib/db.js'
import { env } from '../lib/env.js'
import { uploadFileToR2 } from '../lib/r2.js'

/**
 * Quantas linhas o cursor traz por vez. O ponto de usar cursor é justamente não
 * ter a tabela inteira em memória; o lote existe só para não fazer uma ida ao
 * banco por linha.
 */
const LINHAS_POR_LOTE = 100

type LinhaDoBanco = {
  slug: string
  original_url: string
  access_count: number
  /**
   * O cliente cru do postgres-js devolve o timestamp como texto no formato do
   * Postgres (`2026-08-21 20:28:40.874367+00`), e não como Date: a conversão de
   * tipos do Drizzle não se aplica ao `.unsafe()` usado pelo cursor. O tipo
   * aceita os dois para o código continuar correto se a leitura mudar.
   */
  created_at: Date | string
}

/**
 * A string do Postgres é entendida pelo Date do Node como está. Trocar o espaço
 * por "T" para "deixar ISO" é o que quebraria, porque o fuso vem como `+00`, sem
 * os minutos que o ISO estrito exige.
 */
function paraTextoIso(valor: Date | string) {
  const data = valor instanceof Date ? valor : new Date(valor)

  if (Number.isNaN(data.getTime())) {
    throw new Error(`Data de criação em formato inesperado: ${String(valor)}`)
  }

  return data.toISOString()
}

/**
 * Gera o relatório de links em CSV e devolve a URL pública do arquivo.
 *
 * O caminho do dado é: cursor do Postgres → transformação em linha de CSV →
 * stream do arquivo → R2. Nenhuma etapa acumula a tabela inteira em memória, o
 * que mantém o consumo constante independente da quantidade de links. Por isso
 * o SQL é montado pelo Drizzle e executado pelo cliente cru do postgres-js: é
 * ele que expõe `.cursor()`.
 */
export async function exportLinksReport() {
  const { sql, params } = db
    .select({
      slug: links.slug,
      originalUrl: links.originalUrl,
      accessCount: links.accessCount,
      createdAt: links.createdAt,
    })
    .from(links)
    .orderBy(desc(links.createdAt))
    .toSQL()

  const cursor = pg.unsafe(sql, params as string[]).cursor(LINHAS_POR_LOTE)

  const csv = stringify({
    delimiter: ',',
    header: true,
    columns: [
      { key: 'urlOriginal', header: 'URL original' },
      { key: 'urlEncurtada', header: 'URL encurtada' },
      { key: 'acessos', header: 'Contagem de acessos' },
      { key: 'criadoEm', header: 'Data de criação' },
    ],
  })

  const paraOArmazenamento = new PassThrough()

  const montarCsv = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(lote: LinhaDoBanco[], _encoding, callback) {
        for (const linha of lote) {
          this.push({
            urlOriginal: linha.original_url,
            urlEncurtada: new URL(linha.slug, `${env.SHORT_LINK_BASE_URL}/`).toString(),
            acessos: linha.access_count,
            criadoEm: paraTextoIso(linha.created_at),
          })
        }

        callback()
      },
    }),
    csv,
    paraOArmazenamento,
  )

  const enviar = uploadFileToR2({
    folder: 'reports',
    fileName: 'links.csv',
    contentType: 'text/csv',
    contentStream: paraOArmazenamento,
  })

  // O upload precisa começar a consumir o stream enquanto o pipeline o alimenta:
  // esperar um antes do outro trava, porque o PassThrough tem buffer limitado.
  const [{ url }] = await Promise.all([enviar, montarCsv])

  return { reportUrl: url }
}
