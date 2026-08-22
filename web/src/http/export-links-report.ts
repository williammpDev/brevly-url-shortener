import { request } from './client.js'

type Relatorio = {
  reportUrl: string
}

export async function exportLinksReport() {
  return request<Relatorio>('/links/exports', { method: 'POST' })
}
