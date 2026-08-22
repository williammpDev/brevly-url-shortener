import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '../http/client.js'
import { createLink } from '../http/create-link.js'
import { Button } from './button.js'
import { Card } from './card.js'
import { Input } from './input.js'

/**
 * As mesmas regras que o backend aplica, repetidas aqui de propósito: validar
 * no cliente evita uma ida ao servidor para dizer o óbvio, e o servidor
 * continua validando porque cliente nenhum é confiável.
 */
const novoLinkSchema = z.object({
  originalUrl: z.url('Informe uma URL válida, começando com http:// ou https://'),
  slug: z
    .string()
    .min(3, 'Use ao menos 3 caracteres')
    .max(60, 'Use no máximo 60 caracteres')
    .regex(
      /^[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?$/,
      'Use apenas letras, números e hífen, sem hífen nas pontas',
    ),
})

type NovoLink = z.infer<typeof novoLinkSchema>

export function NewLinkForm() {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<NovoLink>({
    resolver: zodResolver(novoLinkSchema),
    mode: 'onChange',
    defaultValues: { originalUrl: '', slug: '' },
  })

  const { mutateAsync: cadastrar, isPending } = useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      reset()
      queryClient.invalidateQueries({ queryKey: ['links'] })
    },
    onError: (erro) => {
      /**
       * 409 é slug em uso: pertence ao campo, e não a um aviso solto no topo.
       * Mostrar ali é o que permite corrigir sem procurar o que deu errado.
       */
      if (erro instanceof ApiError && erro.status === 409) {
        setError('slug', { message: 'Esse link encurtado já existe' })
        return
      }

      setError('root', {
        message: erro instanceof Error ? erro.message : 'Não foi possível salvar o link.',
      })
    },
  })

  return (
    <Card>
      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit(async (valores) => {
          await cadastrar(valores).catch(() => undefined)
        })}
        noValidate
      >
        <h1 className="text-lg font-bold text-gray-600">Novo link</h1>

        <div className="flex flex-col gap-4">
          <Input
            label="Link original"
            placeholder="www.exemplo.com.br"
            error={errors.originalUrl?.message}
            disabled={isPending}
            {...register('originalUrl')}
          />

          <Input
            label="Link encurtado"
            prefix="brev.ly/"
            error={errors.slug?.message}
            disabled={isPending}
            {...register('slug')}
          />
        </div>

        {errors.root ? (
          <p role="alert" className="text-sm text-danger">
            {errors.root.message}
          </p>
        ) : null}

        <Button type="submit" disabled={!isValid || isPending}>
          {isPending ? 'Salvando...' : 'Salvar link'}
        </Button>
      </form>
    </Card>
  )
}
