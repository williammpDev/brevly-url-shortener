import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'

/**
 * Renderiza com os provedores que a aplicação usa.
 *
 * Cada chamada cria um QueryClient novo: cache compartilhado entre testes faz
 * um teste enxergar o resultado do anterior, e o defeito aparece como
 * intermitência, que é o pior tipo de falha para depurar.
 *
 * Os provedores entram pela opção `wrapper` — e não embrulhando o elemento —
 * porque assim o `rerender` devolvido continua envolvendo a árvore. Embrulhando
 * à mão, o segundo render perde o QueryClient.
 */
export function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}
