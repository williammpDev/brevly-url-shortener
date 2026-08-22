import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    // Sem isto, o CI reprova: não existe web/.env no runner, e a validação de
    // configuração em src/lib/env.ts derruba o import de qualquer componente
    // que fale com a API. Valores de teste, nunca de produção.
    env: {
      VITE_BACKEND_URL: 'http://localhost:3333',
      VITE_FRONTEND_URL: 'http://localhost:5173',
    },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
