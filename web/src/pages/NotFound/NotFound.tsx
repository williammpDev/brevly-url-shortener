import { Link } from 'react-router'
import { Card } from '../../components/card.js'

/**
 * Tela mostrada quando o slug não existe.
 *
 * O vetor do 404 com efeito de glitch está no Figma e ainda não foi exportado
 * (Issue #59); até lá o número é texto com os tokens do tema.
 */
export function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-200 px-3 py-8">
      <Card className="flex w-full max-w-[580px] flex-col items-center gap-6 py-16 text-center">
        <p className="text-[56px] font-bold leading-none text-blue-base">404</p>

        <h1 className="text-xl font-bold text-gray-600">Link não encontrado</h1>

        <p className="max-w-[380px] text-md text-gray-500">
          O link que você está tentando acessar não existe, foi removido ou é uma URL inválida.
          Saiba mais em{' '}
          <Link to="/" className="font-semibold text-blue-base underline hover:text-blue-dark">
            brev.ly
          </Link>
          .
        </p>
      </Card>
    </div>
  )
}
