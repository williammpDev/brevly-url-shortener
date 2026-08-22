import { CopyIcon, TrashIcon } from '@phosphor-icons/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { deleteLink } from '../http/delete-link.js'
import type { Link } from '../http/types.js'
import { env } from '../lib/env.js'
import { IconButton } from './icon-button.js'

/**
 * Uma linha da listagem: URL curta, URL original, contagem de acessos e ações.
 *
 * A URL curta é montada aqui, com a base do próprio frontend — a API devolve só
 * o slug, decisão registrada em docs/arquitetura.md.
 */
export function LinkListItem({ link }: { link: Link }) {
  const shortUrl = new URL(link.slug, env.VITE_FRONTEND_URL).toString()
  const [copia, setCopia] = useState<'ocioso' | 'copiado' | 'falhou'>('ocioso')
  const [erroAoRemover, setErroAoRemover] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { mutate: remover, isPending: removendo } = useMutation({
    mutationFn: () => deleteLink(link.slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] }),
    onError: (erro) =>
      setErroAoRemover(erro instanceof Error ? erro.message : 'Não foi possível remover o link.'),
  })

  /**
   * A remoção é irreversível e não há dono do link: a confirmação é a única
   * proteção contra clique acidental. Usa o diálogo do navegador porque o Figma
   * não desenha modal, e inventar um seria desenhar por conta própria.
   */
  function confirmarRemocao() {
    setErroAoRemover(null)

    if (window.confirm(`Remover o link ${shortUrl}? Essa ação não pode ser desfeita.`)) {
      remover()
    }
  }

  useEffect(() => {
    if (copia === 'ocioso') {
      return
    }

    const tempo = setTimeout(() => setCopia('ocioso'), 2000)

    return () => clearTimeout(tempo)
  }, [copia])

  /**
   * A área de transferência pode recusar: navegador sem permissão, página sem
   * foco, contexto não seguro. Sem o try, a promessa rejeita em silêncio e quem
   * clicou fica sem resposta nenhuma — o pior desfecho possível para um botão.
   */
  async function copiar() {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopia('copiado')
    } catch {
      setCopia('falhou')
    }
  }

  return (
    <li className="flex items-center gap-4 border-t border-gray-200 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <a
          href={shortUrl}
          className="truncate text-md font-semibold text-blue-base hover:text-blue-dark"
        >
          {shortUrl.replace(/^https?:\/\//, '')}
        </a>
        <span className="truncate text-sm text-gray-500">{link.originalUrl}</span>
      </div>

      <span className="shrink-0 text-sm text-gray-500">
        {link.accessCount} {link.accessCount === 1 ? 'acesso' : 'acessos'}
      </span>

      <div className="flex shrink-0 items-center gap-1">
        <IconButton
          aria-label={`Copiar ${shortUrl}`}
          onClick={copiar}
          disabled={removendo}
          title={copia === 'copiado' ? 'Copiado' : 'Copiar link encurtado'}
        >
          <CopyIcon
            className={copia === 'copiado' ? 'size-4 text-blue-base' : 'size-4'}
            weight="bold"
          />
        </IconButton>

        <IconButton
          aria-label={`Remover ${shortUrl}`}
          onClick={confirmarRemocao}
          disabled={removendo}
          title="Remover link"
        >
          <TrashIcon className="size-4" weight="bold" />
        </IconButton>
      </div>

      {/* Anúncio para leitor de tela: o ícone mudar de cor não é percebido por quem não vê. */}
      {erroAoRemover ? (
        <span role="alert" className="shrink-0 text-sm text-danger">
          {erroAoRemover}
        </span>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {copia === 'copiado' ? 'Link copiado para a área de transferência' : ''}
        {copia === 'falhou' ? 'Não foi possível copiar o link' : ''}
      </span>
    </li>
  )
}
