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
