import { WarningIcon } from '@phosphor-icons/react'
import { type ComponentProps, useId } from 'react'

type InputProps = ComponentProps<'input'> & {
  label: string
  /** Mensagem de erro. Presente, muda a borda e é anunciada por leitor de tela. */
  error?: string
}

/**
 * Campo do Style Guide: rótulo em caixa alta acima, borda que reage a foco e a
 * erro, e mensagem de erro com ícone.
 *
 * O rótulo é ligado ao campo por id, e o erro é ligado por `aria-describedby`
 * com `aria-invalid` — sem isso, quem usa leitor de tela ouve o campo mas não
 * sabe que ele está inválido nem por quê.
 */
export function Input({ label, error, className, id, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className={['text-xs font-normal uppercase', error ? 'text-danger' : 'text-gray-500'].join(
          ' ',
        )}
      >
        {label}
      </label>

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[
          'h-12 rounded-lg border px-4 text-md text-gray-600 placeholder:text-gray-400',
          'transition-colors duration-fast ease-standard',
          'focus:outline-none focus-visible:border-blue-base focus-visible:ring-1 focus-visible:ring-blue-base',
          error ? 'border-danger' : 'border-gray-300',
          className ?? '',
        ].join(' ')}
        {...props}
      />

      {error ? (
        <p id={errorId} className="flex items-center gap-2 text-sm text-gray-500">
          <WarningIcon className="size-4 shrink-0 text-danger" weight="fill" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  )
}
