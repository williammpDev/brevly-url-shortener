import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Home } from './Home'

describe('Home', () => {
  it('mostra os dois blocos da tela raiz', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { name: 'Novo link' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Meus links' })).toBeInTheDocument()
  })

  it('usa o layout do produto, com a marca no topo', () => {
    render(<Home />)

    expect(screen.getByText(/brev/)).toBeInTheDocument()
  })
})
