import { eq } from 'drizzle-orm'
import { links } from '../db/schema.js'
import { db } from '../lib/db.js'
import { LinkNotFoundError } from './errors.js'

/**
 * Remove um link pelo slug. O slug é normalizado da mesma forma que no
 * cadastro: quem cadastrou "Meu-Link" gravou "meu-link", e a remoção precisa
 * encontrar o mesmo registro.
 *
 * O delete devolve as linhas afetadas, então uma consulta antes para saber se
 * o link existe seria uma ida a mais ao banco pelo mesmo resultado.
 */
export async function deleteLink(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase()

  const removed = await db.delete(links).where(eq(links.slug, normalizedSlug)).returning()

  if (removed.length === 0) {
    throw new LinkNotFoundError(normalizedSlug)
  }
}
