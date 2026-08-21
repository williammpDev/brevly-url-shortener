import { eq, sql } from 'drizzle-orm'
import { links } from '../db/schema.js'
import { db } from '../lib/db.js'
import { LinkNotFoundError } from './errors.js'

/**
 * Soma 1 ao contador de acessos.
 *
 * O incremento é feito pelo próprio banco, em uma instrução — e não lendo o
 * valor, somando em JavaScript e gravando de volta. Dois acessos simultâneos ao
 * mesmo link leriam o mesmo número e gravariam o mesmo resultado, perdendo uma
 * contagem.
 */
export async function incrementLinkAccess(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase()

  const [updated] = await db
    .update(links)
    .set({ accessCount: sql`${links.accessCount} + 1` })
    .where(eq(links.slug, normalizedSlug))
    .returning()

  if (!updated) {
    throw new LinkNotFoundError(normalizedSlug)
  }

  return updated
}
