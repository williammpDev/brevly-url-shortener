import { request } from './client.js'

export async function deleteLink(slug: string) {
  return request<void>(`/links/${encodeURIComponent(slug)}`, { method: 'DELETE' })
}
