import { randomUUID } from 'node:crypto'
import { basename, extname } from 'node:path'
import type { Readable } from 'node:stream'
import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { env } from './env.js'

/**
 * Cliente do Cloudflare R2, que fala o protocolo do S3. A região é 'auto'
 * porque o R2 não tem regiões no sentido da AWS, e o endpoint é montado a
 * partir do ID da conta — o schema de env garante que ele seja só o ID.
 */
export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
})

type UploadFileInput = {
  folder: string
  fileName: string
  contentType: string
  contentStream: Readable
}

/**
 * Monta a chave do objeto com um UUID na frente, o que atende a exigência de
 * nome aleatório e único do enunciado e evita que duas exportações no mesmo
 * segundo se sobrescrevam. O nome original é sanitizado porque ele vira parte
 * de uma URL pública.
 */
function buildObjectKey({ folder, fileName }: Pick<UploadFileInput, 'folder' | 'fileName'>) {
  const extension = extname(fileName)
  const nameWithoutExtension = basename(fileName, extension).replace(/[^a-zA-Z0-9-]/g, '')

  return `${folder}/${randomUUID()}-${nameWithoutExtension}${extension}`
}

/**
 * Envia um stream para o R2 e devolve a URL pública do arquivo.
 *
 * Usa o Upload do lib-storage, e não o PutObjectCommand, porque ele consome
 * stream sem exigir o tamanho total antecipado — que é o que permite ao
 * relatório em CSV ser transmitido enquanto é gerado, sem passar pela memória.
 */
export async function uploadFileToR2({
  folder,
  fileName,
  contentType,
  contentStream,
}: UploadFileInput) {
  const key = buildObjectKey({ folder, fileName })

  const upload = new Upload({
    client: r2,
    params: {
      Bucket: env.CLOUDFLARE_BUCKET,
      Key: key,
      Body: contentStream,
      ContentType: contentType,
    },
  })

  await upload.done()

  return {
    key,
    url: new URL(key, `${env.CLOUDFLARE_PUBLIC_URL}/`).toString(),
  }
}
