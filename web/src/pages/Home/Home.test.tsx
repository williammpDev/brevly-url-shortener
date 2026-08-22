import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/render-with-providers.js'
import { Home } from './Home'

describe('Home', () => {
  it('mostra os dois blocos da tela raiz', () => {
    renderWithProviders(<Home />)

    expect(screen.getByRole('heading', { name: 'Novo link' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Meus links' })).toBeInTheDocument()
  })

  /** "brev" aparece também no prefixo do campo, então a busca é dentro do topo. */
  it('usa o layout do produto, com a marca no topo', () => {
    renderWithProviders(<Home />)

    expect(within(screen.getByRole('banner')).getByText(/brev/)).toBeInTheDocument()
  })
})
