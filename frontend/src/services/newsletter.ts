import { request } from './api'

export async function subscribeToNewsletter(email: string) {
  return request<{ email: string }>('/newsletter', {
    method: 'POST',
    body: { email },
  })
}
