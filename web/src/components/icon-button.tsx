import type { ComponentProps } from 'react'

/**
 * Botão quadrado de ação em lista — copiar e remover, na listagem de links.
 * Exige `aria-label` porque não tem texto visível: sem isso, quem usa leitor de
 * tela ouve só "botão".
 */
type IconButtonProps = ComponentProps<'button'> & {
  'aria-label': string
}

export function IconButton({ className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={[
        'inline-flex size-8 items-center justify-center rounded-sm',
        'bg-gray-200 text-gray-600',
        'transition-colors duration-fast ease-standard',
        'hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50',
        className ?? '',
      ].join(' ')}
      {...props}
    />
  )
}
