import type {
  AdminDashboard,
  AuthSession,
  AuthUser,
  CatalogResponse,
  CheckoutOrder,
  StoreSnapshot,
} from '../types/api'
import type { Product } from '../types/catalog'

const API_BASE_URL = '/api'
const SESSION_STORAGE_KEY = 'manthan.session'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers()

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  const payload = (await response.json().catch(() => null)) as { message?: string } | null

  if (!response.ok) {
    throw new ApiError(payload?.message ?? 'Request failed.', response.status)
  }

  return payload as T
}

export function getStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as AuthSession
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

export function saveStoredSession(session: AuthSession) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}

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

export async function getCatalog() {
  return request<CatalogResponse>('/catalog')
}

export async function getProductBySlug(slug: string) {
  const response = await request<{ product: Product }>(
    `/catalog/products/${encodeURIComponent(slug)}`,
  )

  return response.product
}

export async function getStore(token: string) {
  return request<StoreSnapshot>('/store', {
    token,
  })
}

export async function addCartItem(
  token: string,
  payload: { productId: string; size: string; quantity: number },
) {
  return request<StoreSnapshot>('/store/cart/items', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function updateCartItemRequest(
  token: string,
  payload: { productId: string; size: string; quantity: number },
) {
  return request<StoreSnapshot>('/store/cart/items', {
    method: 'PATCH',
    token,
    body: payload,
  })
}

export async function removeCartItemRequest(
  token: string,
  payload: { productId: string; size: string },
) {
  return request<StoreSnapshot>('/store/cart/items', {
    method: 'DELETE',
    token,
    body: payload,
  })
}

export async function toggleWishlistRequest(token: string, payload: { productId: string }) {
  return request<StoreSnapshot>('/store/wishlist/toggle', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function checkoutRequest(token: string) {
  return request<{ order: CheckoutOrder; store: StoreSnapshot }>('/store/checkout', {
    method: 'POST',
    token,
  })
}

export async function subscribeToNewsletter(email: string) {
  return request<{ email: string }>('/newsletter', {
    method: 'POST',
    body: { email },
  })
}

export async function getAdminDashboard(token: string) {
  return request<AdminDashboard>('/admin/dashboard', {
    token,
  })
}
