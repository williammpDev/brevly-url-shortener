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
    },
    // Cada arquivo de teste sobe o app inteiro, e o primeiro boot carrega
    // Fastify, Zod e Swagger: ~2s sozinho, mais que isso com os arquivos
    // rodando em paralelo. Os 5s padrao do Vitest reprovavam o primeiro teste
    // de cada arquivo por tempo, sem nada de errado no codigo.
    testTimeout: 20_000,
  },
})
