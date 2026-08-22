import { QueryClient } from '@tanstack/react-query'

/**
 * Uma instância só para o app inteiro. `retry: 1` porque erro de validação e
 * conflito não melhoram com repetição — insistir só atrasa a mensagem para quem
 * está esperando.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
})
