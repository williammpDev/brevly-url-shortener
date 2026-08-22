import { request } from './client.js'

export async function incrementLinkAccess(slug: string) {
  return request<void>(`/links/${encodeURIComponent(slug)}/access-count`, { method: 'PATCH' })
}
