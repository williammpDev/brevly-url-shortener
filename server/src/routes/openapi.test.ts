import { describe, expect, it } from 'vitest'
import { buildApp } from '../app.js'

async function documento() {
  const app = buildApp({ logger: false })
  await app.ready()
  const response = await app.inject({ method: 'GET', url: '/docs/json' })
  await app.close()

  return response
}

describe('documento OpenAPI', () => {
  it('é servido em /docs/json', async () => {
    const response = await documento()

    expect(response.statusCode).toBe(200)
    expect(response.json().openapi).toMatch(/^3\./)
  })

  it('descreve todas as rotas servidas, sem faltar nem sobrar', async () => {
    const { paths } = await documento().then((r) => r.json())

    expect(Object.keys(paths).sort()).toEqual(
      ['/health', '/links', '/links/exports', '/links/{slug}', '/links/{slug}/access-count'].sort(),
    )
    expect(Object.keys(paths['/links']).sort()).toEqual(['get', 'post'])
    expect(Object.keys(paths['/links/{slug}']).sort()).toEqual(['delete', 'get'])
    expect(Object.keys(paths['/links/{slug}/access-count'])).toEqual(['patch'])
  })

  it('descreve o corpo do cadastro a partir do schema Zod da rota', async () => {
    const { paths } = await documento().then((r) => r.json())
    const corpo = paths['/links'].post.requestBody.content['application/json'].schema

    expect(corpo.required.sort()).toEqual(['originalUrl', 'slug'])
    expect(corpo.properties.slug.maxLength).toBe(60)
  })

  /**
   * A rota do relatório não existia quando o documento foi configurado: ela
   * apareceu sozinha ao ser criada, que é o ponto de gerar a documentação a
   * partir dos schemas em vez de escrevê-la à mão.
   */
  it('inclui a rota de exportação do relatório', async () => {
    const { paths } = await documento().then((r) => r.json())

    expect(Object.keys(paths['/links/exports'])).toEqual(['post'])
    expect(paths['/links/exports'].post.responses['200']).toBeDefined()
  })

  it('descreve os códigos de resposta de cada rota, incluindo os de erro', async () => {
    const { paths } = await documento().then((r) => r.json())

    expect(Object.keys(paths['/links'].post.responses).sort()).toEqual(['201', '400', '409'])
    expect(Object.keys(paths['/links/{slug}'].delete.responses).sort()).toEqual(['204', '404'])
  })
})
