import { screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../http/client.js'
import { renderWithProviders } from '../test/render-with-providers.js'
import { LinkList } from './link-list.js'

const mocks = vi.hoisted(() => ({ listLinks: vi.fn() }))

vi.mock('../http/list-links.js', () => ({ listLinks: mocks.listLinks }))

const links = [
  {
    id: '1',
    slug: 'portfolio-dev',
    originalUrl: 'https://devsite.portfolio.com.br/devname-123456',
    accessCount: 30,
    createdAt: '2026-08-22T12:00:00.000Z',
  },
  {
    id: '2',
    slug: 'unico-acesso',
    originalUrl: 'https://exemplo.com/outra',
    accessCount: 1,
    createdAt: '2026-08-21T12:00:00.000Z',
  },
]

describe('LinkList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listLinks.mockResolvedValue(links)
  })

  it('mostra esqueleto enquanto a resposta não chega', () => {
    mocks.listLinks.mockReturnValue(new Promise(() => undefined))

    renderWithProviders(<LinkList />)

    expect(screen.getByLabelText('Carregando links')).toBeInTheDocument()
  })

  it('mostra mensagem própria quando não há link cadastrado', async () => {
    mocks.listLinks.mockResolvedValue([])

    renderWithProviders(<LinkList />)

    expect(await screen.findByText(/Ainda não existem links cadastrados/i)).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('lista os links com URL curta, original e contagem', async () => {
    renderWithProviders(<LinkList />)

    const itens = await screen.findAllByRole('listitem')

    expect(itens).toHaveLength(2)
    expect(within(itens[0]).getByRole('link')).toHaveTextContent('localhost:5173/portfolio-dev')
    expect(within(itens[0])).toBeTruthy()
    expect(itens[0]).toHaveTextContent('https://devsite.portfolio.com.br/devname-123456')
    expect(itens[0]).toHaveTextContent('30 acessos')
  })

  it('escreve "1 acesso" no singular', async () => {
    renderWithProviders(<LinkList />)

    const itens = await screen.findAllByRole('listitem')

    expect(itens[1]).toHaveTextContent('1 acesso')
    expect(itens[1]).not.toHaveTextContent('1 acessos')
  })

  it('copia a URL curta e avisa que copiou', async () => {
    const usuario = userEvent.setup()
    renderWithProviders(<LinkList />)

    const botao = await screen.findByRole('button', {
      name: /Copiar http:\/\/localhost:5173\/portfolio-dev/,
    })
    await usuario.click(botao)

    await waitFor(async () => {
      expect(await navigator.clipboard.readText()).toBe('http://localhost:5173/portfolio-dev')
    })
    expect(screen.getByText('Link copiado para a área de transferência')).toBeInTheDocument()
  })

  /**
   * Aconteceu no navegador: a área de transferência recusou e o botão não deu
   * resposta nenhuma, porque a promessa rejeitava sem tratamento.
   */
  it('avisa quando a área de transferência recusa, em vez de silenciar', async () => {
    const usuario = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('NotAllowedError'))

    renderWithProviders(<LinkList />)

    const [botao] = await screen.findAllByRole('button', { name: /Copiar/ })
    await usuario.click(botao)

    expect(await screen.findByText('Não foi possível copiar o link')).toBeInTheDocument()
  })

  it('mostra o erro da API em vez de lista vazia silenciosa', async () => {
    mocks.listLinks.mockRejectedValue(new ApiError(500, 'Erro interno do servidor.'))

    renderWithProviders(<LinkList />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro interno do servidor.')
  })
})
