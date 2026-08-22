import type { ComponentProps } from 'react'

/** Caixa branca que envolve cada bloco das telas. */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={['rounded-lg bg-white p-6 md:p-8', className ?? ''].join(' ')} {...props} />
  )
}
