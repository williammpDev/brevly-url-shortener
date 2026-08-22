import { screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../http/client.js'
import { renderWithProviders } from '../../test/render-with-providers.js'
import { Redirect } from './Redirect'

const mocks = vi.hoisted(() => ({
  getLinkBySlug: vi.fn(),
  incrementLinkAccess: vi.fn(),
}))

vi.mock('../../http/get-link-by-slug.js', () => ({ getLinkBySlug: mocks.getLinkBySlug }))
vi.mock('../../http/increment-link-access.js', () => ({
  incrementLinkAccess: mocks.incrementLinkAccess,
}))

const link = {
  id: '1',
  slug: 'meu-link',
  originalUrl: 'https://exemplo.com/destino',
  accessCount: 7,
  createdAt: '2026-08-22T12:00:00.000Z',
}

function renderizar() {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/meu-link']}>
      <Routes>
        <Route path="/:slug" element={<Redirect />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getLinkBySlug.mockResolvedValue(link)
    mocks.incrementLinkAccess.mockResolvedValue(undefined)
    vi.stubGlobal('location', { replace: vi.fn(), href: 'http://localhost:5173/meu-link' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('mostra a tela de redirecionamento enquanto resolve', () => {
    mocks.getLinkBySlug.mockReturnValue(new Promise(() => undefined))

    renderizar()

    expect(screen.getByRole('heading', { name: 'Redirecionando...' })).toBeInTheDocument()
  })

  it('busca o link pelo slug da URL', async () => {
    renderizar()

    await waitFor(() => expect(mocks.getLinkBySlug).toHaveBeenCalledWith('meu-link'))
  })

  it('contabiliza o acesso e leva o navegador ao destino', async () => {
    renderizar()

    await waitFor(() => expect(mocks.incrementLinkAccess).toHaveBeenCalledWith('meu-link'))
    await waitFor(() => expect(window.location.replace).toHaveBeenCalledWith(link.originalUrl))
  })

  /**
   * O modo estrito do React roda efeitos duas vezes em desenvolvimento. Sem
   * trava, cada visita contaria dois acessos.
   */
  it('conta o acesso uma única vez, mesmo com o efeito repetido', async () => {
    const { rerender } = renderizar()

    await waitFor(() => expect(mocks.incrementLinkAccess).toHaveBeenCalled())

    rerender(
      <MemoryRouter initialEntries={['/meu-link']}>
        <Routes>
          <Route path="/:slug" element={<Redirect />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(mocks.incrementLinkAccess).toHaveBeenCalledTimes(1)
  })

  it('redireciona mesmo se contabilizar o acesso falhar', async () => {
    mocks.incrementLinkAccess.mockRejectedValue(new ApiError(500, 'Erro interno do servidor.'))

    renderizar()

    await waitFor(() => expect(window.location.replace).toHaveBeenCalledWith(link.originalUrl))
  })

  it('mostra a página de link não encontrado quando a API responde 404', async () => {
    mocks.getLinkBySlug.mockRejectedValue(
      new ApiError(404, 'Nenhum link cadastrado com esse slug.'),
    )

    renderizar()

    expect(await screen.findByRole('heading', { name: 'Link não encontrado' })).toBeInTheDocument()
    expect(window.location.replace).not.toHaveBeenCalled()
  })

  it('oferece o link manual para o destino quando já conhece a URL', async () => {
    renderizar()

    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Acesse aqui' })).toHaveAttribute(
        'href',
        link.originalUrl,
      ),
    )
  })
})
