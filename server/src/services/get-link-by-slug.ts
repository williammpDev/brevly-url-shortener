import { eq } from 'drizzle-orm'
import { links } from '../db/schema.js'
import { db } from '../lib/db.js'
import { LinkNotFoundError } from './errors.js'

/**
 * Busca um link pelo slug, sem efeito colateral: quem chama aqui não conta
 * acesso. A contagem tem rota própria, porque o enunciado lista as duas como
 * funcionalidades separadas e porque a listagem precisa consultar um link sem
 * inflar o contador.
 */
export async function getLinkBySlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase()

  const [link] = await db.select().from(links).where(eq(links.slug, normalizedSlug)).limit(1)

  if (!link) {
    throw new LinkNotFoundError(normalizedSlug)
  }

  return link
}
