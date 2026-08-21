import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      DATABASE_URL: 'postgresql://brevly:brevly@localhost:5432/brevly',
    },
    // Cada arquivo de teste sobe o app inteiro, e o primeiro boot carrega
    // Fastify, Zod e Swagger: ~2s sozinho, mais que isso com os arquivos
    // rodando em paralelo. Os 5s padrao do Vitest reprovavam o primeiro teste
    // de cada arquivo por tempo, sem nada de errado no codigo.
    testTimeout: 20_000,
  },
})
