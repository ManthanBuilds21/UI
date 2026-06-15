import { ShieldCheck, ShoppingBag, Users, WandSparkles } from 'lucide-react'
import Reveal from '../../components/ui/Reveal'

const adminCards = [
  {
    title: 'Orders',
    value: '128',
    description: 'Pending fulfillment across the latest drop.',
    icon: ShoppingBag,
  },
  {
    title: 'Users',
    value: '2.4k',
    description: 'Active customer accounts inside the storefront.',
    icon: Users,
  },
  {
    title: 'Campaigns',
    value: '08',
    description: 'Scheduled visual stories ready for release.',
    icon: WandSparkles,
  },
]

export default function AdminPreviewPage() {
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
        <p className="eyebrow">Note</p>
        <h2 className="mt-4 text-[2.8rem] leading-[0.92] sm:text-[4rem]">
          This is a UI-only admin destination.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-black/[0.68] sm:text-base">
          The front page now has separate sign up and login entry points for both users and admins. The admin route is intentionally a preview interface so the flow feels complete without requiring backend auth.
        </p>
      </Reveal>
    </div>
  )
}
