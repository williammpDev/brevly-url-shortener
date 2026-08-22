import { LinkIcon } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { listLinks } from '../http/list-links.js'
import { Card } from './card.js'
import { LinkListItem } from './link-list-item.js'
import { Skeleton } from './skeleton.js'

export function LinkList() {
  const {
    data: links,
    isPending,
    isError,
    error,
  } = useQuery({ queryKey: ['links'], queryFn: listLinks })

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-600">Meus links</h2>

      {isPending ? <ListaCarregando /> : null}

      {isError ? (
        <p role="alert" className="py-8 text-center text-sm text-danger">
          {error instanceof Error ? error.message : 'Não foi possível carregar seus links.'}
        </p>
      ) : null}

      {links && links.length === 0 ? <ListaVazia /> : null}

      {links && links.length > 0 ? (
        <ul className="flex flex-col">
          {links.map((link) => (
            <LinkListItem key={link.id} link={link} />
          ))}
        </ul>
      ) : null}
    </Card>
  )
}

/**
 * Três linhas cinzas com a mesma altura das reais. Espaço reservado evita o
 * salto de layout quando a resposta chega.
 */
function ListaCarregando() {
  return (
    <div role="status" aria-label="Carregando links" className="flex flex-col">
      {[0, 1, 2].map((linha) => (
        <div key={linha} className="flex items-center gap-4 border-t border-gray-200 py-4">
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="size-8 rounded-sm" />
        </div>
      ))}
    </div>
  )
}

function ListaVazia() {
  return (
    <div className="flex flex-col items-center gap-3 border-t border-gray-200 py-8">
      <LinkIcon className="size-8 text-gray-400" />
      <p className="text-xs uppercase text-gray-500">Ainda não existem links cadastrados</p>
    </div>
  )
}
