import { request } from './client.js'
import type { Link } from './types.js'

export async function listLinks() {
  return request<Link[]>('/links')
}
