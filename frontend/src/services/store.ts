import type { AdminDashboard, CheckoutOrder, StoreSnapshot } from '../types/api'
import { request } from './api'

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

export async function getAdminDashboard(token: string) {
  return request<AdminDashboard>('/admin/dashboard', {
    token,
  })
}
