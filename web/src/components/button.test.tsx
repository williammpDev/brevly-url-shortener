import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button.js'

describe('Button', () => {
  it('mostra o texto recebido', () => {
    render(<Button>Salvar link</Button>)

    expect(screen.getByRole('button', { name: 'Salvar link' })).toBeInTheDocument()
  })

  it('não dispara ação quando desabilitado', async () => {
    const aoClicar = vi.fn()
    render(
      <Button disabled onClick={aoClicar}>
        Salvar link
      </Button>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Salvar link' }))

    expect(aoClicar).not.toHaveBeenCalled()
  })

  it('nasce como type button, para não submeter formulário sem querer', () => {
    render(<Button>Baixar CSV</Button>)

    expect(screen.getByRole('button', { name: 'Baixar CSV' })).toHaveAttribute('type', 'button')
  })
})
