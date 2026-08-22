import type { ComponentProps } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

/**
 * Botão do Style Guide. Duas variantes: a primária, azul e de largura total, do
 * "Salvar link"; e a secundária, cinza clara e discreta, do "Baixar CSV".
 *
 * O estado desabilitado não é só visual — a interface bloqueia ação conforme o
 * estado, que é exigência do enunciado.
 */
const button = tv({
  base: [
    'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold',
    'transition-colors duration-fast ease-standard',
    'disabled:cursor-not-allowed',
  ],
  variants: {
    variant: {
      primary: [
        'bg-blue-base text-white text-md h-12 px-5 w-full',
        'hover:bg-blue-dark',
        'disabled:bg-blue-base/50',
      ],
      secondary: [
        'bg-gray-200 text-gray-500 text-sm h-8 px-2',
        'hover:bg-gray-300',
        'disabled:opacity-50',
      ],
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
})

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof button>

export function Button({ variant, className, ...props }: ButtonProps) {
  return <button type="button" className={button({ variant, className })} {...props} />
}
