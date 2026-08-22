import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/render-with-providers.js'
import { NotFound } from './NotFound'

function renderizar() {
  return renderWithProviders(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>,
  )
}

describe('NotFound', () => {
  it('diz claramente que o link não existe', () => {
    renderizar()

    expect(screen.getByRole('heading', { name: 'Link não encontrado' })).toBeInTheDocument()
    expect(screen.getByText(/não existe, foi removido ou é uma URL inválida/)).toBeInTheDocument()
  })

  it('oferece caminho de volta para a página inicial', () => {
    renderizar()

    expect(screen.getByRole('link', { name: 'brev.ly' })).toHaveAttribute('href', '/')
  })
})
