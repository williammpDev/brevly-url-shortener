import { AppLayout } from '../../components/app-layout.js'
import { Card } from '../../components/card.js'
import { NewLinkForm } from '../../components/new-link-form.js'

/**
 * Página raiz. O formulário de cadastro entra na Issue #22 e a listagem na #23;
 * aqui está a moldura que as duas vão ocupar.
 *
 * Mobile first: uma coluna por padrão, duas a partir de `md`, com a esquerda
 * fixa em 380px como no Figma.
 */
export function Home() {
  return (
    <AppLayout>
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[380px_1fr] md:gap-6">
        <NewLinkForm />

        <Card>
          <h2 className="text-lg font-bold text-gray-600">Meus links</h2>
        </Card>
      </div>
    </AppLayout>
  )
}
