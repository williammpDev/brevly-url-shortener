import { request } from './client.js'
import type { Link } from './types.js'

type CreateLinkInput = {
  slug: string
  originalUrl: string
}

export async function createLink(input: CreateLinkInput) {
  return request<Link>('/links', { method: 'POST', body: input })
}
