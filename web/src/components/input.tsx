import { WarningIcon } from '@phosphor-icons/react'
import { type ComponentProps, useId } from 'react'

type InputProps = Omit<ComponentProps<'input'>, 'prefix'> & {
  label: string
  /** Texto fixo antes do campo, como o `brev.ly/` do link encurtado. */
  prefix?: string
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
 *
 * A borda fica no invólucro, e não no `input`: é o que permite o prefixo viver
 * dentro da mesma caixa e o foco iluminar o conjunto.
 */
export function Input({ label, prefix, error, className, id, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className={['text-xs uppercase', error ? 'text-danger' : 'text-gray-500'].join(' ')}
      >
        {label}
      </label>

      <div
        className={[
          'flex h-12 items-center gap-0.5 rounded-lg border bg-white px-4',
          'transition-colors duration-fast ease-standard',
          'focus-within:border-blue-base focus-within:ring-1 focus-within:ring-blue-base',
          error ? 'border-danger' : 'border-gray-300',
        ].join(' ')}
      >
        {prefix ? (
          <span className="text-md text-gray-400 select-none" aria-hidden>
            {prefix}
          </span>
        ) : null}

        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={[
            'h-full w-full bg-transparent text-md text-gray-600 outline-none',
            'placeholder:text-gray-400',
            className ?? '',
          ].join(' ')}
          {...props}
        />
      </div>

      {error ? (
        <p id={errorId} className="flex items-center gap-2 text-sm text-gray-500">
          <WarningIcon className="size-4 shrink-0 text-danger" weight="fill" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  )
}
