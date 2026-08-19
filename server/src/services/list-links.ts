import { desc } from 'drizzle-orm'
import { links } from '../db/schema.js'
import { db } from '../lib/db.js'

/**
 * Lista os links cadastrados, do mais recente para o mais antigo — é a ordem
 * que a listagem da interface espera, e evita que o link recém-criado apareça
 * no fim de tudo.
 *
 * Sem paginação de propósito: o enunciado pede a lista de links do usuário, e
 * paginar antes de existir volume seria estrutura sem caso de uso.
 */
export async function listLinks() {
  return db.select().from(links).orderBy(desc(links.createdAt))
}
