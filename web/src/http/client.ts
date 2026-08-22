import { env } from '../lib/env.js'

/**
 * Erro de resposta da API, com o status preservado.
 *
 * A rota decide o significado pelo status — 409 é slug em uso, 404 é link
 * inexistente —, então quem chama precisa do número, não só do texto.
 */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
  signal?: AbortSignal
}

/**
 * Único ponto que fala com a API. Concentra a base da URL, o cabeçalho de JSON
 * e a tradução de resposta de erro — as funções de `src/http` cuidam só do
 * contrato de cada endpoint.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(new URL(path, env.VITE_BACKEND_URL), {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  if (!response.ok) {
    throw new ApiError(response.status, await lerMensagemDeErro(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

/**
 * A API responde erro como `{ message }`. Se algo fora do contrato chegar — um
 * proxy devolvendo HTML, por exemplo —, a mensagem genérica evita mostrar lixo
 * na tela.
 */
async function lerMensagemDeErro(response: Response) {
  try {
    const corpo = (await response.json()) as { message?: unknown }

    return typeof corpo.message === 'string' ? corpo.message : 'Não foi possível completar a ação.'
  } catch {
    return 'Não foi possível completar a ação.'
  }
}
