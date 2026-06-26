import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import PillTabs from '../../components/ui/PillTabs'
import Reveal from '../../components/ui/Reveal'
import {
  ApiError,
  getAdminDashboard,
  getAdminOrder,
  getAdminOrders,
  getAdminProducts,
  updateAdminOrderStatus,
  updateAdminProductStock,
} from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import type {
  AdminDashboard,
  AdminOrder,
  AdminOrderDetail,
  AdminOrdersResponse,
  AdminProduct,
  LowStockEntry,
} from '../../types/api'
import { formatPrice } from '../../utils/format'

// ─── Status badge ─────────────────────────────────────────────────────────────

function OrderStatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    FULFILLED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }
  const color = colorMap[status] ?? 'bg-zinc-100 text-zinc-700'
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${color}`}>
      {status}
    </span>
  )
}

function PaymentBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    UNPAID: 'bg-zinc-100 text-zinc-500',
    PAID: 'bg-emerald-100 text-emerald-700',
    FAILED: 'bg-red-100 text-red-700',
  }
  const color = colorMap[status] ?? 'bg-zinc-100 text-zinc-500'
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${color}`}>
      {status}
    </span>
  )
}

// ─── Order Detail Slide-over ──────────────────────────────────────────────────

function OrderDetailModal({
  orderId,
  token,
  onClose,
}: {
  orderId: string
  token: string
  onClose: () => void
}) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null)

  useEffect(() => {
    void getAdminOrder(token, orderId).then((r) => setOrder(r.order))
  }, [token, orderId])

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close panel"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      />
      <div className="w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white px-6 py-4">
          <div>
            <p className="eyebrow">Order Detail</p>
            <p className="mt-1 font-mono text-sm text-black/50">#{orderId.slice(0, 12).toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-black/40 transition-colors hover:bg-black/5 hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!order ? (
          <div className="flex h-64 items-center justify-center text-sm text-black/40">Loading…</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex gap-3">
              <OrderStatusBadge status={order.status} />
              <PaymentBadge status={order.paymentStatus} />
            </div>

            {/* Customer */}
            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="eyebrow mb-2">Customer</p>
              <p className="font-semibold">{order.customerName}</p>
              <p className="text-sm text-black/50">{order.customerEmail}</p>
            </div>

            {/* Address */}
            {order.address && (
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="eyebrow mb-2">Shipping Address</p>
                <p className="text-sm leading-6 text-black/70">
                  {order.address.name}<br />
                  {order.address.street}<br />
                  {order.address.city}, {order.address.state} {order.address.postalCode}<br />
                  {order.address.country}<br />
                  <span className="text-black/40">{order.address.phone}</span>
                </p>
              </div>
            )}

            {/* Items */}
            <div>
              <p className="eyebrow mb-3">Items</p>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-zinc-50 p-3">
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-black/40">Size: {item.size} · Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="rounded-xl bg-black p-4 text-white space-y-2">
              <div className="flex justify-between text-sm text-white/60">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/60">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Razorpay IDs */}
            {(order.razorpayOrderId || order.razorpayPaymentId) && (
              <div className="rounded-xl bg-zinc-50 p-4 space-y-1">
                <p className="eyebrow mb-2">Payment IDs</p>
                {order.razorpayOrderId && (
                  <p className="font-mono text-xs text-black/50 break-all">Order: {order.razorpayOrderId}</p>
                )}
                {order.razorpayPaymentId && (
                  <p className="font-mono text-xs text-black/50 break-all">Payment: {order.razorpayPaymentId}</p>
                )}
              </div>
            )}

            <p className="text-xs text-black/30">Placed {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({
  dashboard,
  onNavigateToProducts,
}: {
  dashboard: AdminDashboard
  onNavigateToProducts: () => void
}) {
  const statCards = [
    {
      label: 'Total Orders',
      value: String(dashboard.orderCount),
      icon: Package,
    },
    {
      label: 'Revenue',
      value: formatPrice(dashboard.revenue),
      icon: TrendingUp,
    },
    {
      label: 'Customers',
      value: String(dashboard.userCount),
      icon: Users,
    },
    {
      label: 'Low Stock Alerts',
      value: String(dashboard.lowStockProducts.length),
      icon: AlertTriangle,
      alert: dashboard.lowStockProducts.length > 0,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Reveal key={card.label}>
              <article
                className={`campaign-surface p-6 sm:p-7 ${card.alert ? 'bg-amber-50' : 'bg-[var(--cloud)]'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="eyebrow">{card.label}</p>
                  <Icon className={`h-5 w-5 ${card.alert ? 'text-amber-500' : 'text-black/[0.45]'}`} />
                </div>
                <p className={`mt-5 text-[2.8rem] font-semibold leading-none ${card.alert ? 'text-amber-600' : 'text-black'}`}>
                  {card.value}
                </p>
              </article>
            </Reveal>
          )
        })}
      </div>

      {/* Low stock table */}
      {dashboard.lowStockProducts.length > 0 && (
        <Reveal className="campaign-surface bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-black/5 p-5 sm:p-6">
            <div>
              <p className="eyebrow">Low Stock Alerts</p>
              <p className="mt-1 text-sm text-black/50">Products with ≤ 3 units remaining</p>
            </div>
            <button
              onClick={onNavigateToProducts}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50 transition-colors hover:text-black"
            >
              Manage Stock →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 bg-zinc-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">Product</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">Size</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40 text-right">Stock</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.lowStockProducts.map((entry: LowStockEntry, i: number) => (
                  <tr key={i} className="border-b border-black/5 last:border-0">
                    <td className="px-5 py-3 font-medium">{entry.productName}</td>
                    <td className="px-5 py-3 text-black/50">{entry.size}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${entry.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {entry.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      )}
    </div>
  )
}

// ─── Tab: Orders ──────────────────────────────────────────────────────────────

function OrdersTab({ token }: { token: string }) {
  const toast = useToast()
  const [data, setData] = useState<AdminOrdersResponse | null>(null)
  const [page, setPage] = useState(1)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = useCallback(
    (p: number) => {
      void getAdminOrders(token, p).then(setData)
    },
    [token],
  )

  useEffect(() => {
    load(page)
  }, [load, page])

  const handleStatusChange = async (orderId: string, status: 'CONFIRMED' | 'FULFILLED' | 'CANCELLED') => {
    setUpdatingId(orderId)
    try {
      await updateAdminOrderStatus(token, orderId, status)
      toast.success('Order status updated.')
      load(page)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not update order.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (!data) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-black/40">
        Loading orders…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {detailId && (
        <OrderDetailModal
          orderId={detailId}
          token={token}
          onClose={() => setDetailId(null)}
        />
      )}

      <Reveal className="campaign-surface bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-black/5 p-5 sm:p-6">
          <div>
            <p className="eyebrow">All Orders</p>
            <p className="mt-1 text-sm text-black/50">{data.total} total · Page {data.page} of {data.totalPages}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-zinc-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">Order</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">Customer</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">Date</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40 text-center">Items</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40 text-right">Total</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">Payment</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order: AdminOrder) => (
                <tr key={order.id} className="border-b border-black/5 last:border-0 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDetailId(order.id)}
                      className="font-mono text-xs text-black hover:underline"
                    >
                      #{order.id.slice(0, 8).toUpperCase()}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-black/40">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-black/50">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-black/60">{order.itemCount}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <PaymentBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id || order.status === 'CANCELLED'}
                      onChange={(e) =>
                        void handleStatusChange(
                          order.id,
                          e.target.value as 'CONFIRMED' | 'FULFILLED' | 'CANCELLED',
                        )
                      }
                      className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs font-medium text-black/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-40"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="FULFILLED">Fulfilled</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-black/5 px-5 py-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/50 transition-colors hover:bg-black/5 hover:text-black disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <span className="text-xs text-black/40">
              {page} / {data.totalPages}
            </span>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/50 transition-colors hover:bg-black/5 hover:text-black disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </Reveal>
    </div>
  )
}

// ─── Tab: Stock Manager ───────────────────────────────────────────────────────

function StockManagerTab({ token }: { token: string }) {
  const toast = useToast()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [editingCell, setEditingCell] = useState<{ productId: string; size: string } | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    void getAdminProducts(token).then((r) => setProducts(r.products))
  }, [token])

  const handleStockEdit = (productId: string, size: string, current: number) => {
    setEditingCell({ productId, size })
    setEditValue(String(current))
  }

  const handleStockSave = async (productId: string, size: string) => {
    const stock = parseInt(editValue, 10)
    if (isNaN(stock) || stock < 0) {
      toast.error('Stock must be a non-negative integer.')
      return
    }

    try {
      const result = await updateAdminProductStock(token, productId, size, stock)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stockBySize: result.product.stockBySize }
            : p,
        ),
      )
      toast.success('Stock updated.')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not update stock.')
    } finally {
      setEditingCell(null)
      setEditValue('')
    }
  }

  // Flatten products × sizes into rows
  const rows: Array<{ product: AdminProduct; size: string; stock: number }> = []
  for (const product of products) {
    for (const size of product.sizes) {
      rows.push({
        product,
        size,
        stock: product.stockBySize[size] ?? 0,
      })
    }
  }

  return (
    <Reveal className="campaign-surface bg-white overflow-hidden">
      <div className="border-b border-black/5 p-5 sm:p-6">
        <p className="eyebrow">Stock Manager</p>
        <p className="mt-1 text-sm text-black/50">Click any stock value to edit it inline. Press Enter to save.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-zinc-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">Product</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">Collection</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">Size</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/40 text-right">Stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, size, stock }) => {
              const isEditing =
                editingCell?.productId === product.id && editingCell?.size === size
              const isLow = stock <= 3

              return (
                <tr key={`${product.id}-${size}`} className="border-b border-black/5 last:border-0 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium">{product.name}</td>
                  <td className="px-5 py-3 text-black/40 text-xs">{product.collectionName}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black/60">
                      {size}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {isEditing ? (
                      <input
                        autoFocus
                        type="number"
                        min={0}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void handleStockSave(product.id, size)
                          if (e.key === 'Escape') setEditingCell(null)
                        }}
                        onBlur={() => void handleStockSave(product.id, size)}
                        className="w-20 rounded-lg border border-black/20 bg-white px-2 py-1 text-right text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black/20"
                      />
                    ) : (
                      <button
                        onClick={() => handleStockEdit(product.id, size, stock)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors hover:opacity-70 ${
                          stock === 0
                            ? 'bg-red-100 text-red-700'
                            : isLow
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                        title="Click to edit"
                      >
                        {isLow && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                        {stock}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Reveal>
  )
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────

const TABS = ['Overview', 'Orders', 'Stock Manager'] as const
type Tab = (typeof TABS)[number]

export default function AdminPreviewPage() {
  const { token } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)

  useEffect(() => {
    if (!token) return
    void getAdminDashboard(token)
      .then(setDashboard)
      .catch((error) => {
        toast.error(error instanceof ApiError ? error.message : 'Could not load dashboard.')
      })
  }, [token, toast])

  if (!token) return null

  return (
    <div className="page-shell pb-12">
      {/* Header */}
      <Reveal
        className="section-frame campaign-surface overflow-hidden px-5 py-8 text-white sm:px-8 sm:py-10"
        style={{ backgroundColor: '#111111' }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-white/[0.45]">Admin Dashboard</p>
            <h1 className="mt-5 max-w-3xl text-[3.5rem] leading-[0.88] sm:text-[5.5rem] lg:text-[7rem]">
              Control center.
            </h1>
          </div>
          <div className="rounded-full border border-white/[0.18] bg-white/[0.08] p-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      </Reveal>

      {/* Tabs */}
      <Reveal className="section-frame mt-8">
        <PillTabs
          active={activeTab}
          items={[...TABS]}
          onChange={(t) => setActiveTab(t as Tab)}
          layoutId="admin-tabs"
        />
      </Reveal>

      {/* Tab Content */}
      <div className="section-frame mt-8">
        {activeTab === 'Overview' && dashboard && (
          <OverviewTab
            dashboard={dashboard}
            onNavigateToProducts={() => setActiveTab('Stock Manager')}
          />
        )}
        {activeTab === 'Overview' && !dashboard && (
          <div className="flex h-48 items-center justify-center text-sm text-black/40">
            Loading dashboard…
          </div>
        )}
        {activeTab === 'Orders' && <OrdersTab token={token} />}
        {activeTab === 'Stock Manager' && <StockManagerTab token={token} />}
      </div>
    </div>
  )
}
