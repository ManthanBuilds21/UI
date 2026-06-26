import type {
  Address,
  AdminDashboard,
  AdminOrder,
  AdminOrderDetail,
  AdminOrdersResponse,
  AdminProduct,
  AuthSession,
  AuthUser,
  CatalogResponse,
  CheckoutOrder,
  OrderDetail,
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

// ─── Auth ─────────────────────────────────────────────────────────────────────

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

// ─── Catalog ──────────────────────────────────────────────────────────────────

export async function getCatalog() {
  return request<CatalogResponse>('/catalog')
}

export async function getProductBySlug(slug: string) {
  const response = await request<{ product: Product }>(
    `/catalog/products/${encodeURIComponent(slug)}`,
  )

  return response.product
}

// ─── Store (cart + wishlist) ──────────────────────────────────────────────────

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

export async function mergeGuestCart(
  token: string,
  items: Array<{ productId: string; size: string; quantity: number }>,
) {
  return request<StoreSnapshot>('/store/cart/merge', {
    method: 'POST',
    token,
    body: { items },
  })
}

export async function checkoutRequest(token: string) {
  return request<{ order: CheckoutOrder; store: StoreSnapshot }>('/store/checkout', {
    method: 'POST',
    token,
  })
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export async function saveAddressRequest(token: string, payload: {
  id?: string
  name: string
  street: string
  city: string
  state: string
  postalCode: string
  country?: string
  phone: string
}) {
  return request<{ address: Address }>('/checkout/address', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function initiateCheckoutRequest(token: string, addressId: string) {
  return request<{
    orderId: string
    razorpayOrderId: string
    amount: number
    currency: string
    keyId: string
  }>('/checkout/initiate', {
    method: 'POST',
    token,
    body: { addressId },
  })
}

export async function verifyCheckoutRequest(token: string, payload: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}) {
  return request<{ orderId: string }>('/checkout/verify', {
    method: 'POST',
    token,
    body: payload,
  })
}

// ─── Account ──────────────────────────────────────────────────────────────────

export async function getAccountOrders(token: string) {
  return request<{ orders: OrderDetail[] }>('/account/orders', { token })
}

export async function getAccountOrder(token: string, id: string) {
  return request<{ order: OrderDetail }>(`/account/orders/${id}`, { token })
}

export async function getAccountAddresses(token: string) {
  return request<{ addresses: Address[] }>('/account/addresses', { token })
}

export async function addAccountAddress(
  token: string,
  payload: {
    name: string
    street: string
    city: string
    state: string
    postalCode: string
    country?: string
    phone: string
  },
) {
  return request<{ address: Address }>('/account/addresses', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function updateAccountAddress(
  token: string,
  id: string,
  payload: {
    name: string
    street: string
    city: string
    state: string
    postalCode: string
    country?: string
    phone: string
  },
) {
  return request<{ address: Address }>(`/account/addresses/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  })
}

export async function deleteAccountAddress(token: string, id: string) {
  return request<{ success: boolean }>(`/account/addresses/${id}`, {
    method: 'DELETE',
    token,
  })
}

export async function setDefaultAddress(token: string, id: string) {
  return request<{ addresses: Address[] }>(`/account/addresses/${id}/default`, {
    method: 'PATCH',
    token,
  })
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAdminDashboard(token: string) {
  return request<AdminDashboard>('/admin/dashboard', { token })
}

export async function getAdminOrders(token: string, page = 1) {
  return request<AdminOrdersResponse>(`/admin/orders?page=${page}`, { token })
}

export async function getAdminOrder(token: string, id: string) {
  return request<{ order: AdminOrderDetail }>(`/admin/orders/${id}`, { token })
}

export async function updateAdminOrderStatus(
  token: string,
  id: string,
  status: 'CONFIRMED' | 'FULFILLED' | 'CANCELLED',
) {
  return request<{ order: AdminOrder }>(`/admin/orders/${id}`, {
    method: 'PATCH',
    token,
    body: { status },
  })
}

export async function getAdminProducts(token: string) {
  return request<{ products: AdminProduct[] }>('/admin/products', { token })
}

export async function updateAdminProductStock(
  token: string,
  id: string,
  size: string,
  stock: number,
) {
  return request<{ product: AdminProduct }>(`/admin/products/${id}/stock`, {
    method: 'PATCH',
    token,
    body: { size, stock },
  })
}

export async function subscribeToNewsletter(email: string) {
  return request<{ email: string }>('/newsletter', {
    method: 'POST',
    body: { email },
  })
}

export async function forgotPassword(email: string) {
  return request<{ success: boolean; message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  })
}

export async function resetPassword(email: string, token: string, password: string) {
  return request<{ success: boolean; message: string }>('/auth/reset-password', {
    method: 'POST',
    body: { email, token, password },
  })
}
