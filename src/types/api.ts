import type { CollectionSpotlight, FilterCategory, Product } from './catalog'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

export interface AuthSession {
  token: string
  user: AuthUser
}

export interface CartItem {
  productId: string
  size: string
  quantity: number
}

export interface StoreSnapshot {
  cart: CartItem[]
  wishlist: string[]
  cartCount: number
  subtotal: number
}

export interface CatalogResponse {
  categories: FilterCategory[]
  collections: CollectionSpotlight[]
  products: Product[]
}

export interface CheckoutOrder {
  id: string
  total: number
  createdAt: string
}

export interface AdminOrderPreview {
  id: string
  customerName: string
  customerEmail: string
  total: number
  createdAt: string
  itemCount: number
  status: string
  items: Array<{
    productName: string
    size: string
    quantity: number
  }>
}

export interface AdminDashboard {
  orderCount: number
  userCount: number
  collectionCount: number
  orders: AdminOrderPreview[]
}
