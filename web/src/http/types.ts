/** Um link como a API devolve. Espelha o schema de resposta do backend. */
export type Link = {
  id: string
  slug: string
  originalUrl: string
  accessCount: number
  createdAt: string
}
