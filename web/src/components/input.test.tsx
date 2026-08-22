import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from './input.js'

describe('Input', () => {
  it('liga o rótulo ao campo, então o campo é encontrado pelo nome', () => {
    render(<Input label="LINK ORIGINAL" placeholder="www.exemplo.com.br" />)

    expect(screen.getByLabelText('LINK ORIGINAL')).toBeInTheDocument()
  })

  it('sem erro, não marca o campo como inválido', () => {
    render(<Input label="LINK ORIGINAL" />)

    expect(screen.getByLabelText('LINK ORIGINAL')).not.toHaveAttribute('aria-invalid')
  })

  it('com erro, marca como inválido e descreve o motivo para leitor de tela', () => {
    render(<Input label="LINK ENCURTADO" error="Informe uma URL válida." />)

    const campo = screen.getByLabelText('LINK ENCURTADO')

    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(campo).toHaveAccessibleDescription('Informe uma URL válida.')
  })
})
