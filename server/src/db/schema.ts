import { integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

/**
 * Um link encurtado. O slug é escolhido por quem cadastra, não gerado pelo
 * sistema, e por isso precisa de índice único: é ele que a rota de
 * redirecionamento consulta e é nele que o cadastro detecta conflito.
 */
export const links = pgTable(
  'links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    originalUrl: text('original_url').notNull(),
    accessCount: integer('access_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('links_slug_unique').on(table.slug)],
)

export type Link = typeof links.$inferSelect
export type NewLink = typeof links.$inferInsert
