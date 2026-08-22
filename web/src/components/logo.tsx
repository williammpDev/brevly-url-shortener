import { LinkIcon } from '@phosphor-icons/react'

/**
 * Marca do produto.
 *
 * O símbolo definitivo é um vetor do Figma que ainda não foi exportado — o
 * navegador caiu antes disso (Issue de asset). Até lá, o ícone abaixo segura o
 * lugar com a mesma cor e proporção, e a troca é de uma linha.
 */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 text-blue-base">
      <LinkIcon className="size-6" weight="bold" aria-hidden />
      <span className="text-lg font-bold text-gray-600">
        brev<span className="text-blue-base">.ly</span>
      </span>
    </span>
  )
}
