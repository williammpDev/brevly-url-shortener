import { DownloadSimpleIcon } from '@phosphor-icons/react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { exportLinksReport } from '../http/export-links-report.js'
import { Button } from './button.js'

/**
 * Aciona a geração do relatório e leva o usuário até o arquivo.
 *
 * O frontend não monta o CSV: ele pede, recebe a URL pública do R2 e navega
 * até ela. A navegação usa `window.location`, e não um link `download`, porque
 * o arquivo está em outro domínio — o atributo `download` é ignorado em origem
 * cruzada, e o navegador baixa sozinho pelo content-type do R2.
 */
export function DownloadCsvButton({ disabled }: { disabled?: boolean }) {
  const [erro, setErro] = useState<string | null>(null)

  const { mutate: baixar, isPending } = useMutation({
    mutationFn: exportLinksReport,
    onMutate: () => setErro(null),
    onSuccess: ({ reportUrl }) => {
      window.location.href = reportUrl
    },
    onError: (falha) =>
      setErro(falha instanceof Error ? falha.message : 'Não foi possível gerar o relatório.'),
  })

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="secondary"
        onClick={() => baixar()}
        disabled={disabled || isPending}
        aria-busy={isPending}
      >
        <DownloadSimpleIcon className="size-4" weight="bold" aria-hidden />
        {isPending ? 'Gerando...' : 'Baixar CSV'}
      </Button>

      {erro ? (
        <span role="alert" className="text-sm text-danger">
          {erro}
        </span>
      ) : null}
    </div>
  )
}
