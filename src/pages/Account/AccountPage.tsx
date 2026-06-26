import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Edit2,
  LogOut,
  MapPin,
  Package,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import PillTabs from '../../components/ui/PillTabs'
import Reveal from '../../components/ui/Reveal'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import {
  addAccountAddress,
  deleteAccountAddress,
  getAccountAddresses,
  getAccountOrder,
  getAccountOrders,
  setDefaultAddress,
  updateAccountAddress,
} from '../../lib/api'
import type { Address, OrderDetail } from '../../types/api'
import { formatPrice } from '../../utils/format'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  FULFILLED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
}

const PAYMENT_COLORS: Record<string, string> = {
  UNPAID: 'bg-zinc-100 text-zinc-600',
  PAID: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-600',
}

// ─── Order Row (accordion) ────────────────────────────────────────────────────

function OrderRow({ order: summary, token }: { order: OrderDetail; token: string }) {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (!open && !detail) {
      setLoading(true)
      try {
        const res = await getAccountOrder(token, summary.id)
        setDetail(res.order)
      } catch {
        // fall back to summary data
        setDetail(summary)
      } finally {
        setLoading(false)
      }
    }
    setOpen((v) => !v)
  }

  const displayed = detail ?? summary
  const statusColor = STATUS_COLORS[summary.status] ?? 'bg-zinc-100 text-zinc-600'
  const paymentColor = PAYMENT_COLORS[summary.paymentStatus] ?? 'bg-zinc-100 text-zinc-600'

  return (
    <Reveal className="campaign-surface bg-white overflow-hidden">
      {/* Header row */}
      <button
        onClick={handleToggle}
        className="w-full px-6 py-5 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left hover:bg-black/[0.02] transition-colors"
      >
        <div className="flex flex-col gap-1">
          <span className="eyebrow text-black/40 text-[10px]">
            Order #{summary.id.slice(-8).toUpperCase()}
          </span>
          <span className="text-sm text-black/50">
            {new Date(summary.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusColor}`}
          >
            {summary.status}
          </span>
          <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${paymentColor}`}>
            {summary.paymentStatus}
          </span>
          <span className="text-lg font-semibold">{formatPrice(summary.total)}</span>
          <span className="text-black/40 ml-1">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </div>
      </button>

      {/* Accordion content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-black/5"
          >
            <div className="px-6 py-6 sm:px-8 sm:py-8 grid gap-8">
              {loading ? (
                <div className="py-8 text-center text-sm text-black/40 animate-pulse">
                  Loading order details…
                </div>
              ) : (
                <>
                  {/* Items */}
                  <div>
                    <p className="eyebrow text-black/40 text-[10px] mb-4">Items</p>
                    <div className="grid gap-4">
                      {displayed.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-20 w-16 flex-shrink-0 rounded-lg object-cover bg-[var(--cloud)]"
                          />
                          <div className="flex flex-col justify-center gap-0.5">
                            <p className="font-semibold text-sm leading-snug">{item.productName}</p>
                            <p className="text-xs text-black/50">
                              Size: {item.size} · Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-medium mt-1">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Breakdown + Address */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Payment breakdown */}
                    <div>
                      <p className="eyebrow text-black/40 text-[10px] mb-4">Payment</p>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-black/60">Subtotal</span>
                          <span>{formatPrice(displayed.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-black/60">Shipping</span>
                          <span>
                            {displayed.shipping === 0 ? 'Free' : formatPrice(displayed.shipping)}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold border-t border-black/5 pt-2 mt-1">
                          <span>Total</span>
                          <span>{formatPrice(displayed.total)}</span>
                        </div>
                        {displayed.razorpayPaymentId && (
                          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--cloud)] px-3 py-2.5">
                            <CreditCard className="h-4 w-4 text-black/40 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/40">
                                Payment ID
                              </p>
                              <p className="text-xs font-mono text-black/70 mt-0.5 break-all">
                                {displayed.razorpayPaymentId}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping address */}
                    {displayed.address && (
                      <div>
                        <p className="eyebrow text-black/40 text-[10px] mb-4">Delivered to</p>
                        <div className="rounded-xl bg-[var(--cloud)] px-4 py-4 text-sm leading-6">
                          <p className="font-semibold">{displayed.address.name}</p>
                          <p className="text-black/60 mt-1">{displayed.address.street}</p>
                          <p className="text-black/60">
                            {displayed.address.city}, {displayed.address.state}{' '}
                            {displayed.address.postalCode}
                          </p>
                          <p className="text-black/60">{displayed.address.country}</p>
                          <p className="text-black/50 mt-1 text-xs">{displayed.address.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reveal>
  )
}

// ─── Address Form Modal ───────────────────────────────────────────────────────

interface AddressFormValues {
  name: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

const EMPTY_FORM: AddressFormValues = {
  name: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  phone: '',
}

interface AddressModalProps {
  open: boolean
  initial: Address | null
  onClose: () => void
  onSave: (values: AddressFormValues) => Promise<void>
}

function AddressModal({ open, initial, onClose, onSave }: AddressModalProps) {
  const [form, setForm] = useState<AddressFormValues>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name,
              street: initial.street,
              city: initial.city,
              state: initial.state,
              postalCode: initial.postalCode,
              country: initial.country,
              phone: initial.phone,
            }
          : EMPTY_FORM,
      )
    }
  }, [open, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
    } finally {
      setSaving(false)
    }
  }

  const field = (
    label: string,
    key: keyof AddressFormValues,
    placeholder?: string,
    colSpan?: boolean,
  ) => (
    <div className={colSpan ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-black/50 mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder ?? label}
        required
        className="w-full rounded-xl border border-black/10 bg-[var(--cloud)] px-4 py-3 text-sm outline-none transition-all focus:border-black/30 focus:bg-white focus:shadow-sm placeholder:text-black/30"
      />
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5">
              <h2 className="text-base font-semibold">
                {initial ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-black/40 hover:text-black hover:bg-black/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field('Full Name', 'name', 'Recipient name', true)}
              {field('Street Address', 'street', '123 Main St', true)}
              {field('City', 'city', 'Mumbai')}
              {field('State', 'state', 'Maharashtra')}
              {field('Postal Code', 'postalCode', '400001')}
              {field('Country', 'country', 'India')}
              {field('Phone', 'phone', '+91 98765 43210', true)}

              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold hover:bg-[var(--cloud)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-black text-white px-4 py-3 text-sm font-semibold hover:bg-black/80 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Address'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Address Card ─────────────────────────────────────────────────────────────

interface AddressCardProps {
  address: Address
  onEdit: (address: Address) => void
  onDelete: (id: string) => Promise<void>
  onSetDefault: (id: string) => Promise<void>
}

function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingDefault, setSettingDefault] = useState(false)

  const handleDelete = async () => {
    setDeletingId(address.id)
    try {
      await onDelete(address.id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetDefault = async () => {
    setSettingDefault(true)
    try {
      await onSetDefault(address.id)
    } finally {
      setSettingDefault(false)
    }
  }

  return (
    <Reveal className={`campaign-surface bg-white p-6 relative flex flex-col gap-4 ${address.isDefault ? 'ring-1 ring-black/20' : ''}`}>
      {address.isDefault && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black px-3 py-1">
          <Star className="h-3 w-3 text-white fill-white" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
            Default
          </span>
        </div>
      )}

      <div className={`text-sm leading-6 ${address.isDefault ? 'mt-6' : ''}`}>
        <p className="font-semibold text-base">{address.name}</p>
        <p className="text-black/60 mt-1">{address.street}</p>
        <p className="text-black/60">
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p className="text-black/60">{address.country}</p>
        <p className="text-black/50 mt-2 text-xs">{address.phone}</p>
      </div>

      <div className="flex gap-2 pt-2 border-t border-black/5">
        <button
          onClick={() => onEdit(address)}
          className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold hover:bg-[var(--cloud)] transition-colors"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </button>

        {!address.isDefault && (
          <button
            onClick={handleSetDefault}
            disabled={settingDefault}
            className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold hover:bg-[var(--cloud)] transition-colors disabled:opacity-50"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {settingDefault ? '…' : 'Set Default'}
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={deletingId === address.id}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {deletingId === address.id ? '…' : 'Delete'}
        </button>
      </div>
    </Reveal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { token, user, logout } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('Orders')
  const [orders, setOrders] = useState<OrderDetail[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Address modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  useEffect(() => {
    if (!token) return

    Promise.all([
      getAccountOrders(token).then((res) => setOrders(res.orders)),
      getAccountAddresses(token).then((res) => setAddresses(res.addresses)),
    ])
      .catch(() => toast.error('Could not load account details.'))
      .finally(() => setIsLoading(false))
  }, [token, toast])

  // ─── Address handlers ───────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingAddress(null)
    setModalOpen(true)
  }

  const openEditModal = (address: Address) => {
    setEditingAddress(address)
    setModalOpen(true)
  }

  const handleSaveAddress = async (values: {
    name: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    phone: string
  }) => {
    if (!token) return
    try {
      if (editingAddress) {
        const res = await updateAccountAddress(token, editingAddress.id, values)
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingAddress.id ? res.address : a)),
        )
        toast.success('Address updated.')
      } else {
        const res = await addAccountAddress(token, values)
        setAddresses((prev) => [...prev, res.address])
        toast.success('Address added.')
      }
      setModalOpen(false)
    } catch {
      toast.error('Could not save address.')
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!token) return
    try {
      await deleteAccountAddress(token, id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast.success('Address deleted.')
    } catch {
      toast.error('Could not delete address.')
    }
  }

  const handleSetDefault = async (id: string) => {
    if (!token) return
    try {
      const res = await setDefaultAddress(token, id)
      setAddresses(res.addresses)
      toast.success('Default address updated.')
    } catch {
      toast.error('Could not update default address.')
    }
  }

  if (isLoading) return null

  return (
    <>
      <div className="page-shell pb-16">
        {/* Hero header */}
        <Reveal className="section-frame campaign-surface overflow-hidden px-5 py-8 sm:px-8 sm:py-10 bg-[var(--beige)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Account</p>
              <h1 className="mt-5 max-w-4xl text-[3rem] leading-[0.86] sm:text-[5rem] lg:text-[6.5rem]">
                Welcome back, {user?.name.split(' ')[0]}.
              </h1>
              <p className="mt-5 text-sm leading-7 text-black/[0.68] sm:text-base">
                {user?.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white/50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] transition-colors hover:bg-white self-start lg:self-auto"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </Reveal>

        {/* Tabs */}
        <Reveal className="section-frame mt-10">
          <PillTabs
            active={activeTab}
            items={['Orders', 'Addresses']}
            onChange={setActiveTab}
            layoutId="account-tabs"
          />
        </Reveal>

        {/* Tab content */}
        <div className="section-frame mt-8">
          <AnimatePresence mode="wait">
            {activeTab === 'Orders' ? (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {orders.length === 0 ? (
                  <Reveal className="campaign-surface bg-[var(--cloud)] p-8 sm:p-12 text-center">
                    <Package className="mx-auto h-10 w-10 text-black/20" />
                    <p className="mt-4 text-sm leading-7 text-black/[0.68]">
                      You haven't placed any orders yet.
                    </p>
                  </Reveal>
                ) : (
                  <div className="grid gap-4">
                    {orders.map((order) => (
                      <OrderRow key={order.id} order={order} token={token!} />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-black/50">
                    {addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}
                  </p>
                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 rounded-full bg-black text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-black/80 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <Reveal className="campaign-surface bg-[var(--cloud)] p-8 sm:p-12 text-center">
                    <MapPin className="mx-auto h-10 w-10 text-black/20" />
                    <p className="mt-4 text-sm leading-7 text-black/[0.68]">
                      You have no saved addresses.
                    </p>
                    <button
                      onClick={openAddModal}
                      className="mt-6 flex items-center gap-2 mx-auto rounded-full bg-black text-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-black/80 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add your first address
                    </button>
                  </Reveal>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {addresses.map((address) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        onEdit={openEditModal}
                        onDelete={handleDeleteAddress}
                        onSetDefault={handleSetDefault}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Address modal */}
      <AddressModal
        open={modalOpen}
        initial={editingAddress}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveAddress}
      />
    </>
  )
}
