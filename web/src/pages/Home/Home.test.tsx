import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Home } from './Home'

describe('Home', () => {
  it('mostra o nome do produto no título da página', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { name: 'Brev.ly' })).toBeInTheDocument()
  })
})
