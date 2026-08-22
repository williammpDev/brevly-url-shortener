import type { ReactNode } from 'react'
import { Logo } from './logo.js'

/**
 * Moldura das páginas: fundo cinza, conteúdo centralizado e a marca no topo.
 *
 * O respiro das bordas fica no elemento de fora, e não no container: no Figma a
 * área de conteúdo tem 980px de largura útil (380 + 24 de intervalo + 576), e
 * padding por dentro comeria esses 980.
 *
 * Construído mobile first — a marca só sai do centro a partir de `md`, que é
 * onde o layout deixa de ser uma coluna só.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-gray-200 px-3 py-8 md:px-8 md:py-20">
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-8">
        <header className="flex justify-center md:justify-start">
          <Logo />
        </header>

        <main className="flex flex-col gap-8">{children}</main>
      </div>
    </div>
  )
}
