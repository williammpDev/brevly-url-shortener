import { LinkIcon } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useParams } from 'react-router'
import { Card } from '../../components/card.js'
import { ApiError } from '../../http/client.js'
import { getLinkBySlug } from '../../http/get-link-by-slug.js'
import { incrementLinkAccess } from '../../http/increment-link-access.js'
import { NotFound } from '../NotFound/NotFound'

/**
 * Página `/:slug`. Consulta a URL original, contabiliza o acesso e leva o
 * navegador ao destino.
 *
 * O backend separa buscar de contar, então são duas chamadas. A contagem é
 * aguardada antes de sair da página: navegar cancela requisição em andamento, e
 * um acesso perdido é pior do que alguns milissegundos a mais nesta tela — que
 * é justamente a tela que o design criou para esse intervalo.
 */
export function Redirect() {
  const { slug = '' } = useParams()
  const jaContou = useRef(false)

  const { data: link, error } = useQuery({
    queryKey: ['link', slug],
    queryFn: () => getLinkBySlug(slug),
    retry: false,
  })

  useEffect(() => {
    if (!link || jaContou.current) {
      return
    }

    /**
     * A trava existe por causa do modo estrito do React, que roda o efeito duas
     * vezes em desenvolvimento: sem ela, cada visita contaria dois acessos.
     */
    jaContou.current = true

    // Guardado fora da função: dentro dela o TypeScript perde a garantia de que
    // `link` existe, porque a checagem ficou no escopo de cima.
    const destino = link.originalUrl

    async function contarEIr() {
      try {
        await incrementLinkAccess(slug)
      } catch {
        // Falhar em contar não pode impedir a pessoa de chegar ao destino.
      }

      window.location.replace(destino)
    }

    void contarEIr()
  }, [link, slug])

  if (error instanceof ApiError && error.status === 404) {
    return <NotFound />
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-200 px-3 py-8">
      <Card className="flex w-full max-w-[580px] flex-col items-center gap-6 py-16 text-center">
        <LinkIcon className="size-12 text-blue-base" weight="bold" aria-hidden />

        <h1 className="text-xl font-bold text-gray-600">Redirecionando...</h1>

        <p className="text-md text-gray-500">
          O link será aberto automaticamente em alguns instantes.
          <br />
          Não foi redirecionado?{' '}
          <a
            href={link?.originalUrl ?? '/'}
            className="font-semibold text-blue-base underline hover:text-blue-dark"
          >
            Acesse aqui
          </a>
        </p>
      </Card>
    </div>
  )
}
