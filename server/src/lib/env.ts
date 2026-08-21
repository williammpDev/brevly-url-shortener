import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3333),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z
    .url({
      error: (issue) =>
        issue.input === undefined
          ? 'variável obrigatória ausente'
          : 'precisa ser uma URL de conexão válida',
    })
    .refine((value) => value.startsWith('postgresql://'), {
      error: 'precisa começar com postgresql://',
    }),

  // O painel do Cloudflare mostra o endpoint completo bem ao lado do ID, e
  // colar o endpoint aqui gera uma URL duplicada que falha com erro obscuro.
  // A validação de formato transforma isso em mensagem clara na inicialização.
  CLOUDFLARE_ACCOUNT_ID: z
    .string()
    .regex(
      /^[0-9a-f]{32}$/,
      'é o ID da conta, 32 caracteres hexadecimais — sem https:// e sem .r2.cloudflarestorage.com',
    ),
  CLOUDFLARE_ACCESS_KEY_ID: z.string().min(1, 'variável obrigatória ausente'),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string().min(1, 'variável obrigatória ausente'),
  CLOUDFLARE_BUCKET: z.string().min(1, 'variável obrigatória ausente'),
  CLOUDFLARE_PUBLIC_URL: z.url('precisa ser a URL pública do bucket, começando com https://'),

  // Base das URLs curtas, usada para montar a coluna "URL encurtada" do
  // relatório. A API continua devolvendo só o slug nas rotas: quem monta a URL
  // na interface é o front, com o próprio VITE_FRONTEND_URL. Aqui o server
  // precisa saber, porque o CSV é lido fora do navegador.
  SHORT_LINK_BASE_URL: z.url(
    'precisa ser a URL do frontend com protocolo, como http://localhost:5173',
  ),
})

export type Env = z.infer<typeof envSchema>

/**
 * Valida a configuração do processo. Recebe a fonte por parâmetro para o teste
 * conseguir exercitar os casos inválidos sem mexer no ambiente real.
 */
export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source)

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('\n')

    throw new Error(`Variáveis de ambiente inválidas:\n${details}`)
  }

  return result.data
}

export const env = parseEnv()
