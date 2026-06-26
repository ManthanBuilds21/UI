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

// ─── Admin types ──────────────────────────────────────────────────────────────

export interface LowStockEntry {
  productId: string
  productName: string
  size: string
  stock: number
}

export interface AdminDashboard {
  orderCount: number
  userCount: number
  revenue: number
  lowStockProducts: LowStockEntry[]
}

export interface AdminOrderItem {
  productName: string
  size: string
  quantity: number
  unitPrice: number
}

export interface AdminOrder {
  id: string
  customerName: string
  customerEmail: string
  total: number
  subtotal: number
  shipping: number
  createdAt: string
  itemCount: number
  status: 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED'
  paymentStatus: 'UNPAID' | 'PAID' | 'FAILED'
  items: AdminOrderItem[]
}

export interface AdminOrderDetail extends AdminOrder {
  address: Address | null
  razorpayOrderId?: string
  razorpayPaymentId?: string
}

export interface AdminProduct {
  id: string
  name: string
  slug: string
  collectionName: string
  price: number
  sizes: string[]
  stockBySize: Record<string, number>
}

export interface AdminOrdersResponse {
  orders: AdminOrder[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── Account / user types ─────────────────────────────────────────────────────

export interface Address {
  id: string
  userId: string
  name: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productName: string
  productSlug: string
  productImage: string
  size: string
  quantity: number
  unitPrice: number
}

export interface OrderDetail {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED'
  paymentStatus: 'UNPAID' | 'PAID' | 'FAILED'
  subtotal: number
  shipping: number
  total: number
  createdAt: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  items: OrderItem[]
  address?: Address | null
}

// Legacy — kept for backwards compat
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
