import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema.js'
import { env } from './env.js'

/**
 * Driver postgres-js, e não node-postgres: é ele que expõe `.cursor()`, de que
 * a exportação do relatório em CSV depende para percorrer a tabela sem carregar
 * tudo em memória (Issue #18). Por isso o cliente cru também é exportado.
 */
export const pg = postgres(env.DATABASE_URL)

export const db = drizzle(pg, { schema })
