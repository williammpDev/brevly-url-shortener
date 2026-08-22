import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      DATABASE_URL: 'postgresql://brevly:brevly@localhost:5432/brevly',
      // Valores de formato válido, sem credencial real: os testes que tocam o
      // R2 usam o SDK mockado, mas o modulo de env e validado no import.
      CLOUDFLARE_ACCOUNT_ID: '0123456789abcdef0123456789abcdef',
      CLOUDFLARE_ACCESS_KEY_ID: 'chave-de-teste',
      CLOUDFLARE_SECRET_ACCESS_KEY: 'segredo-de-teste',
      CLOUDFLARE_BUCKET: 'bucket-de-teste',
      CLOUDFLARE_PUBLIC_URL: 'https://pub-exemplo.r2.dev',
      SHORT_LINK_BASE_URL: 'https://brev.ly',
    },
    // O boot do app carrega Fastify, Zod e Swagger e leva alguns segundos. Com
    // os arquivos em paralelo, os 5s padrao do Vitest reprovavam o primeiro
    // teste de cada arquivo por tempo. Depois que o app passou a ser criado uma
    // vez por arquivo (src/test/shared-app.ts), 10s sobra com folga.
    testTimeout: 10_000,
  },
})
