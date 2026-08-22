import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { Home } from './pages/Home/Home'
import { NotFound } from './pages/NotFound/NotFound'

vi.mock('./http/list-links.js', () => ({ listLinks: vi.fn().mockResolvedValue([]) }))

/**
 * Exercita as rotas com o roteador em memória: o App usa BrowserRouter, que
 * depende do endereço real do navegador e não serve para teste.
 */
function renderizarEm(caminho: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[caminho]}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('rotas', () => {
  it('a raiz mostra o cadastro e a listagem', () => {
    renderizarEm('/')

    expect(screen.getByRole('heading', { name: 'Novo link' })).toBeInTheDocument()
  })

  it('endereço fora do padrão cai em link não encontrado', () => {
    renderizarEm('/pagina/que/nao/existe')

    expect(screen.getByRole('heading', { name: 'Link não encontrado' })).toBeInTheDocument()
  })
})
