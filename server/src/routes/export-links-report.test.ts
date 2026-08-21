import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from '../app.js'

const mocks = vi.hoisted(() => ({ exportLinksReport: vi.fn() }))

vi.mock('../services/export-links-report.js', () => ({
  exportLinksReport: mocks.exportLinksReport,
}))

async function exportar() {
  const app = buildApp({ logger: false })
  const response = await app.inject({ method: 'POST', url: '/links/exports' })
  await app.close()

  return response
}

describe('POST /links/exports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.exportLinksReport.mockResolvedValue({
      reportUrl: 'https://pub-exemplo.r2.dev/reports/uuid-links.csv',
    })
  })

  it('devolve 200 com a URL do relatório', async () => {
    const response = await exportar()

    expect(response.statusCode).toBe(200)
    expect(response.json().reportUrl).toBe('https://pub-exemplo.r2.dev/reports/uuid-links.csv')
  })

  it('devolve 500 quando a geração falha', async () => {
    mocks.exportLinksReport.mockRejectedValue(new Error('R2 fora do ar'))

    expect((await exportar()).statusCode).toBe(500)
  })
})
