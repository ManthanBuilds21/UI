import { ShieldCheck, ShoppingBag, Users, WandSparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Reveal from '../../components/ui/Reveal'
import { ApiError, getAdminDashboard } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import type { AdminDashboard } from '../../types/api'
import { formatPrice } from '../../utils/format'

const initialDashboard: AdminDashboard = {
  orderCount: 0,
  userCount: 0,
  collectionCount: 0,
  orders: [],
}

export default function AdminPreviewPage() {
  const { token } = useAuth()
  const [dashboard, setDashboard] = useState<AdminDashboard>(initialDashboard)

  useEffect(() => {
    if (!token) {
      return
    }

    void getAdminDashboard(token)
      .then((nextDashboard) => {
        setDashboard(nextDashboard)
      })
      .catch((error) => {
        console.error(error)
        window.alert(
          error instanceof ApiError
            ? error.message
            : 'We could not load the admin dashboard right now.',
        )
      })
  }, [token])

  const adminCards = useMemo(
    () => [
      {
        title: 'Orders',
        value: String(dashboard.orderCount),
        description: 'Live order volume across the current storefront.',
        icon: ShoppingBag,
      },
      {
        title: 'Users',
        value: String(dashboard.userCount),
        description: 'Registered customer accounts in the database.',
        icon: Users,
      },
      {
        title: 'Campaigns',
        value: String(dashboard.collectionCount).padStart(2, '0'),
        description: 'Collections currently driving the storefront catalog.',
        icon: WandSparkles,
      },
    ],
    [dashboard.collectionCount, dashboard.orderCount, dashboard.userCount],
  )

  return (
    <div className="page-shell pb-8">
      <Reveal
        className="section-frame campaign-surface overflow-hidden px-5 py-8 text-white sm:px-8 sm:py-10"
        style={{ backgroundColor: '#111111' }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-white/[0.45]">Admin Preview</p>
            <h1 className="mt-5 max-w-5xl text-[4rem] leading-[0.86] sm:text-[6rem] lg:text-[7.6rem]">
              Admin login lands on a clean control view.
            </h1>
          </div>
          <div className="rounded-full border border-white/[0.18] bg-white/[0.08] p-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      </Reveal>

      <div className="section-frame mt-10 grid gap-6 xl:grid-cols-3">
        {adminCards.map((card) => {
          const Icon = card.icon

          return (
            <Reveal key={card.title}>
              <article className="campaign-surface bg-[var(--cloud)] p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">{card.title}</p>
                  <Icon className="h-5 w-5 text-black/[0.55]" />
                </div>
                <p className="mt-6 text-[3.5rem] font-semibold leading-none text-black">
                  {card.value}
                </p>
                <p className="mt-4 text-sm leading-7 text-black/[0.68]">
                  {card.description}
                </p>
              </article>
            </Reveal>
          )
        })}
      </div>

      <Reveal className="section-frame mt-10 campaign-surface bg-[var(--beige)] p-6 sm:p-8">
        <p className="eyebrow">Recent Orders</p>
        <h2 className="mt-4 text-[2.8rem] leading-[0.92] sm:text-[4rem]">
          Live storefront orders now flow into the admin view.
        </h2>
        {dashboard.orders.length === 0 ? (
          <p className="mt-4 max-w-3xl text-sm leading-7 text-black/[0.68] sm:text-base">
            Orders placed from the cart will appear here automatically once checkout is completed.
          </p>
        ) : (
          <div className="mt-8 grid gap-4">
            {dashboard.orders.map((order) => (
              <article key={order.id} className="rounded-[1.6rem] bg-white/80 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="eyebrow">{order.customerEmail}</p>
                    <h3 className="mt-3 text-[1.8rem] leading-[0.92]">{order.customerName}</h3>
                    <p className="mt-3 text-sm leading-7 text-black/[0.68]">
                      {order.items
                        .map((item) => `${item.productName} x${item.quantity} (${item.size})`)
                        .join(' / ')}
                    </p>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/[0.5]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-black">
                      {formatPrice(order.total)}
                    </p>
                    <p className="mt-2 text-sm text-black/[0.62]">
                      {order.itemCount} item{order.itemCount === 1 ? '' : 's'} / {order.status}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  )
}
