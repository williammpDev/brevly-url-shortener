/**
 * Bloco cinza que ocupa o espaço do conteúdo enquanto ele carrega.
 *
 * Existe para a lista não "pular" quando os dados chegam: o esqueleto tem a
 * mesma altura das linhas reais.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={['animate-pulse rounded-sm bg-gray-200', className ?? ''].join(' ')}
      aria-hidden
    />
  )
}
