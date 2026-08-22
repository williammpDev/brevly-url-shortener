import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../http/client.js'
import { renderWithProviders } from '../test/render-with-providers.js'
import { DownloadCsvButton } from './download-csv-button.js'

const mocks = vi.hoisted(() => ({ exportLinksReport: vi.fn() }))

vi.mock('../http/export-links-report.js', () => ({ exportLinksReport: mocks.exportLinksReport }))

const RELATORIO = { reportUrl: 'https://pub-exemplo.r2.dev/reports/uuid-links.csv' }

function botao() {
  return screen.getByRole('button', { name: /baixar csv|gerando/i })
}

describe('DownloadCsvButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.exportLinksReport.mockResolvedValue(RELATORIO)
    // location é somente leitura no jsdom: substituir permite ver para onde iria.
    vi.stubGlobal('location', { href: 'http://localhost:5173/' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fica desabilitado quando não há link para exportar', () => {
    renderWithProviders(<DownloadCsvButton disabled />)

    expect(botao()).toBeDisabled()
  })

  it('leva o usuário até a URL devolvida pela API', async () => {
    const usuario = userEvent.setup()
    renderWithProviders(<DownloadCsvButton />)

    await usuario.click(botao())

    await waitFor(() => expect(window.location.href).toBe(RELATORIO.reportUrl))
  })

  /** O CSV usa cursor no banco: pode demorar, e o botão precisa dizer isso. */
  it('mostra que está gerando e bloqueia novo clique durante o processo', async () => {
    const usuario = userEvent.setup()
    mocks.exportLinksReport.mockImplementation(() => new Promise(() => undefined))

    renderWithProviders(<DownloadCsvButton />)
    await usuario.click(botao())

    expect(await screen.findByRole('button', { name: /gerando/i })).toBeDisabled()
  })

  it('mostra o erro da API em vez de falhar em silêncio', async () => {
    const usuario = userEvent.setup()
    mocks.exportLinksReport.mockRejectedValue(
      new ApiError(429, 'Muitas requisições em pouco tempo.'),
    )

    renderWithProviders(<DownloadCsvButton />)
    await usuario.click(botao())

    expect(await screen.findByRole('alert')).toHaveTextContent('Muitas requisições em pouco tempo.')
  })

  it('não navega quando a geração falha', async () => {
    const usuario = userEvent.setup()
    mocks.exportLinksReport.mockRejectedValue(new ApiError(500, 'Erro interno do servidor.'))

    renderWithProviders(<DownloadCsvButton />)
    await usuario.click(botao())

    await screen.findByRole('alert')
    expect(window.location.href).toBe('http://localhost:5173/')
  })
})
