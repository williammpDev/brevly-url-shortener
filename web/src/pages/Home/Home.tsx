import { AppLayout } from '../../components/app-layout.js'
import { LinkList } from '../../components/link-list.js'
import { NewLinkForm } from '../../components/new-link-form.js'

/**
 * Página raiz: formulário de cadastro e listagem dos links.
 *
 * Mobile first — uma coluna por padrão, duas a partir de `md`, com a esquerda
 * fixa em 380px como no Figma.
 */
export function Home() {
  return (
    <AppLayout>
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[380px_1fr] md:gap-6">
        <NewLinkForm />

        <LinkList />
      </div>
    </AppLayout>
  )
}
