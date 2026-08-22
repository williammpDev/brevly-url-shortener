import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../http/client.js'
import { renderWithProviders } from '../test/render-with-providers.js'
import { LinkListItem } from './link-list-item.js'

const mocks = vi.hoisted(() => ({ deleteLink: vi.fn() }))

vi.mock('../http/delete-link.js', () => ({ deleteLink: mocks.deleteLink }))

const link = {
  id: '1',
  slug: 'portfolio-dev',
  originalUrl: 'https://devsite.portfolio.com.br/devname-123456',
  accessCount: 30,
  createdAt: '2026-08-22T12:00:00.000Z',
}

function botaoRemover() {
  return screen.getByRole('button', { name: /Remover/ })
}

describe('LinkListItem — remoção', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.deleteLink.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  /** A remoção é irreversível: o primeiro clique não pode apagar nada. */
  it('não remove no primeiro clique, sem confirmação', async () => {
    const usuario = userEvent.setup()
    vi.stubGlobal(
      'confirm',
      vi.fn(() => false),
    )

    renderWithProviders(<LinkListItem link={link} />)
    await usuario.click(botaoRemover())

    expect(window.confirm).toHaveBeenCalled()
    expect(mocks.deleteLink).not.toHaveBeenCalled()
  })

  it('remove pelo slug quando a pessoa confirma', async () => {
    const usuario = userEvent.setup()
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    )

    renderWithProviders(<LinkListItem link={link} />)
    await usuario.click(botaoRemover())

    await waitFor(() => expect(mocks.deleteLink).toHaveBeenCalledWith('portfolio-dev'))
  })

  it('mostra a URL completa na confirmação, para não apagar o link errado', async () => {
    const usuario = userEvent.setup()
    const confirmar = vi.fn(() => false)
    vi.stubGlobal('confirm', confirmar)

    renderWithProviders(<LinkListItem link={link} />)
    await usuario.click(botaoRemover())

    expect(confirmar).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:5173/portfolio-dev'),
    )
  })

  it('mostra o erro quando a remoção falha', async () => {
    const usuario = userEvent.setup()
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    )
    mocks.deleteLink.mockRejectedValue(new ApiError(404, 'Nenhum link cadastrado com esse slug.'))

    renderWithProviders(<LinkListItem link={link} />)
    await usuario.click(botaoRemover())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nenhum link cadastrado com esse slug.',
    )
  })

  it('bloqueia as duas ações da linha enquanto remove', async () => {
    const usuario = userEvent.setup()
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    )
    mocks.deleteLink.mockImplementation(() => new Promise(() => undefined))

    renderWithProviders(<LinkListItem link={link} />)
    await usuario.click(botaoRemover())

    await waitFor(() => expect(botaoRemover()).toBeDisabled())
    expect(screen.getByRole('button', { name: /Copiar/ })).toBeDisabled()
  })
})
