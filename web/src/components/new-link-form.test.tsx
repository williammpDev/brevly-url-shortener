import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../http/client.js'
import { renderWithProviders } from '../test/render-with-providers.js'
import { NewLinkForm } from './new-link-form.js'

const mocks = vi.hoisted(() => ({ createLink: vi.fn() }))

vi.mock('../http/create-link.js', () => ({ createLink: mocks.createLink }))

const linkCriado = {
  id: '0b8a2f1e-6f0e-4d4a-9f3a-1d2c3b4a5e6f',
  slug: 'meu-link',
  originalUrl: 'https://exemplo.com/pagina',
  accessCount: 0,
  createdAt: '2026-08-22T12:00:00.000Z',
}

function campos() {
  return {
    original: screen.getByLabelText('Link original'),
    encurtado: screen.getByLabelText('Link encurtado'),
    salvar: screen.getByRole('button', { name: /salvar link/i }),
  }
}

describe('NewLinkForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createLink.mockResolvedValue(linkCriado)
  })

  it('começa com o botão desabilitado, porque não há o que salvar', () => {
    renderWithProviders(<NewLinkForm />)

    expect(campos().salvar).toBeDisabled()
  })

  it('recusa URL malformada antes de chamar a API', async () => {
    renderWithProviders(<NewLinkForm />)
    const { original, encurtado } = campos()

    await userEvent.type(original, 'nao-e-url')
    await userEvent.type(encurtado, 'meu-link')

    expect(await screen.findByText(/Informe uma URL válida/)).toBeInTheDocument()
    expect(mocks.createLink).not.toHaveBeenCalled()
  })

  it('recusa slug com caractere fora do permitido', async () => {
    renderWithProviders(<NewLinkForm />)
    const { original, encurtado } = campos()

    await userEvent.type(original, 'https://exemplo.com/pagina')
    await userEvent.type(encurtado, 'meu link!')

    expect(await screen.findByText(/apenas letras, números e hífen/)).toBeInTheDocument()
  })

  it('envia os valores digitados quando tudo é válido', async () => {
    renderWithProviders(<NewLinkForm />)
    const { original, encurtado } = campos()

    await userEvent.type(original, 'https://exemplo.com/pagina')
    await userEvent.type(encurtado, 'meu-link')
    await userEvent.click(campos().salvar)

    // O React Query passa um segundo argumento de contexto para a mutationFn,
    // então a asserção olha só o primeiro, que é o corpo da requisição.
    await waitFor(() => {
      expect(mocks.createLink.mock.calls[0]?.[0]).toEqual({
        originalUrl: 'https://exemplo.com/pagina',
        slug: 'meu-link',
      })
    })
  })

  it('limpa o formulário depois de salvar', async () => {
    renderWithProviders(<NewLinkForm />)
    const { original, encurtado } = campos()

    await userEvent.type(original, 'https://exemplo.com/pagina')
    await userEvent.type(encurtado, 'meu-link')
    await userEvent.click(campos().salvar)

    await waitFor(() => expect(campos().original).toHaveValue(''))
  })

  /** O 409 do backend é a única falha que o usuário consegue corrigir sozinho. */
  it('mostra o conflito de slug no próprio campo, e não como erro genérico', async () => {
    mocks.createLink.mockRejectedValue(new ApiError(409, 'O slug "meu-link" já está em uso.'))

    renderWithProviders(<NewLinkForm />)
    const { original, encurtado } = campos()

    await userEvent.type(original, 'https://exemplo.com/pagina')
    await userEvent.type(encurtado, 'meu-link')
    await userEvent.click(campos().salvar)

    expect(await screen.findByText('Esse link encurtado já existe')).toBeInTheDocument()
    expect(screen.getByLabelText('Link encurtado')).toHaveAttribute('aria-invalid', 'true')
  })

  it('mostra falha inesperada sem inventar culpa no campo', async () => {
    mocks.createLink.mockRejectedValue(new ApiError(500, 'Erro interno do servidor.'))

    renderWithProviders(<NewLinkForm />)
    const { original, encurtado } = campos()

    await userEvent.type(original, 'https://exemplo.com/pagina')
    await userEvent.type(encurtado, 'meu-link')
    await userEvent.click(campos().salvar)

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro interno do servidor.')
  })

  it('bloqueia o botão enquanto o envio está em andamento', async () => {
    let liberar: (valor: unknown) => void = () => undefined
    mocks.createLink.mockImplementation(
      () =>
        new Promise((resolve) => {
          liberar = resolve
        }),
    )

    renderWithProviders(<NewLinkForm />)
    const { original, encurtado } = campos()

    await userEvent.type(original, 'https://exemplo.com/pagina')
    await userEvent.type(encurtado, 'meu-link')
    await userEvent.click(campos().salvar)

    expect(await screen.findByRole('button', { name: /salvando/i })).toBeDisabled()

    liberar(linkCriado)
  })
})
