import type { AuthSession, AuthUser } from '../types/api'
import { request } from './api'

export async function signup(payload: {
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
}) {
  return request<AuthSession>('/auth/signup', {
    method: 'POST',
    body: payload,
  })
}

export async function login(payload: {
  email: string
  password: string
  role: 'user' | 'admin'
}) {
  return request<AuthSession>('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export async function getCurrentUser(token: string) {
  const response = await request<{ user: AuthUser }>('/auth/me', {
    token,
  })

  return response.user
}
