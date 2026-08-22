import { request } from './client.js'
import type { Link } from './types.js'

export async function getLinkBySlug(slug: string) {
  return request<Link>(`/links/${encodeURIComponent(slug)}`)
}
