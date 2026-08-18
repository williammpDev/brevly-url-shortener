import { defineConfig } from 'drizzle-kit'

// A config não importa src/lib/env.ts de propósito: o drizzle-kit compila este
// arquivo por conta própria, e a resolução dos imports com extensão .js do
// server não vale aqui. A checagem abaixo cobre o mesmo caso de erro.
const url = process.env.DATABASE_URL

if (!url) {
  throw new Error(
    'DATABASE_URL não definida. Rode os comandos db:* pelos scripts do package.json, que carregam o .env da raiz.',
  )
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
})
