import { z } from 'zod'

/**
 * Configuração do frontend. Validada no carregamento do módulo, como no server:
 * variável faltando vira erro imediato e legível, em vez de `undefined` virando
 * URL quebrada no meio de uma requisição.
 */
const envSchema = z.object({
  VITE_BACKEND_URL: z.url('precisa ser a URL da API, com protocolo'),
  VITE_FRONTEND_URL: z.url('precisa ser a URL pública do frontend, com protocolo'),
})

export const env = envSchema.parse(import.meta.env)
