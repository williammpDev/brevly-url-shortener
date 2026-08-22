import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppLayout } from './app-layout.js'

describe('AppLayout', () => {
  it('mostra a marca do produto', () => {
    render(<AppLayout>conteúdo</AppLayout>)

    expect(screen.getByText(/brev/)).toBeInTheDocument()
  })

  it('renderiza o conteúdo dentro da região principal', () => {
    render(
      <AppLayout>
        <p>conteúdo da página</p>
      </AppLayout>,
    )

    expect(screen.getByRole('main')).toHaveTextContent('conteúdo da página')
  })
})
