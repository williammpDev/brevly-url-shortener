import { links } from '../db/schema.js'
import { db } from '../lib/db.js'
import { SlugAlreadyInUseError } from './errors.js'

type CreateLinkInput = {
  slug: string
  originalUrl: string
}

/** Código do Postgres para violação de unicidade. */
const UNIQUE_VIOLATION = '23505'

/**
 * O Drizzle embrulha a falha do banco num DrizzleQueryError e deixa o
 * PostgresError original em `cause` — por isso a checagem percorre a cadeia em
 * vez de olhar só a raiz. O limite de profundidade evita laço em cause cíclico.
 */
function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error

  for (let depth = 0; current != null && depth < 5; depth += 1) {
    if (typeof current === 'object' && 'code' in current && current.code === UNIQUE_VIOLATION) {
      return true
    }

    current = (current as { cause?: unknown }).cause
  }

  return false
}

/**
 * Cadastra um link. O slug é normalizado para minúsculas: quem digita a URL
 * curta depois não presta atenção em caixa, então Meu-Link e meu-link precisam
 * ser o mesmo link.
 *
 * A unicidade é garantida pelo índice do banco, não por uma consulta antes do
 * insert: entre consultar e inserir cabe outro cadastro com o mesmo slug.
 */
export async function createLink({ slug, originalUrl }: CreateLinkInput) {
  const normalizedSlug = slug.trim().toLowerCase()

  try {
    const [link] = await db.insert(links).values({ slug: normalizedSlug, originalUrl }).returning()

    return link
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new SlugAlreadyInUseError(normalizedSlug)
    }

    throw error
  }
}
