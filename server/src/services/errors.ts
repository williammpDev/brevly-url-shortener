/**
 * Erros de regra de negócio. Ficam aqui, e não nas rotas, porque quem sabe que
 * um slug já está em uso é o service — a rota só traduz isso para HTTP.
 */
export class SlugAlreadyInUseError extends Error {
  readonly slug: string

  constructor(slug: string) {
    super(`O slug "${slug}" já está em uso.`)
    this.name = 'SlugAlreadyInUseError'
    this.slug = slug
  }
}

export class LinkNotFoundError extends Error {
  readonly slug: string

  constructor(slug: string) {
    super(`Nenhum link cadastrado com o slug "${slug}".`)
    this.name = 'LinkNotFoundError'
    this.slug = slug
  }
}
