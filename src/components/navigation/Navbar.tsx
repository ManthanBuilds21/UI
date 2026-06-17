import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Menu, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useStore } from '../../hooks/useStore'

const navigationLinks = [
  { to: '/', label: 'Entry' },
  { to: '/website', label: 'Home' },
  { to: '/collections', label: 'Collections' },
  { to: '/about', label: 'About' },
  { to: '/cart', label: 'Cart' },
  { to: '/admin', label: 'Admin' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { cartCount, wishlist } = useStore()

  return (
    <>
      <header className="page-shell fixed inset-x-0 top-0 z-[110] pt-4 sm:pt-6">
        <div className="section-frame">
          <div className="flex items-center justify-between rounded-full border border-black/10 bg-white/[0.72] px-4 py-3 shadow-[0_10px_32px_rgba(17,17,17,0.08)] backdrop-blur-xl sm:px-6">
            <Link to="/website" className="font-display text-[1.65rem] leading-none text-black">
              MANTHAN
            </Link>

            <nav className="hidden items-center gap-8 lg:flex">
              {navigationLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active text-black' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
                ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-black/70">
                <Heart className="h-4 w-4" />
                {wishlist.length}
              </div>
              <Link
                to="/cart"
                className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartCount}
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full border border-black/10 p-3 text-black lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[130] bg-black/[0.35] px-4 py-4 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="campaign-surface noise-mask ml-auto flex min-h-full w-full max-w-sm flex-col bg-[var(--beige)] p-6"
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[1.5rem]">MANTHAN</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-black/10 p-3"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-16 flex flex-1 flex-col gap-6">
                {navigationLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="font-display text-[2.4rem] leading-[0.92] text-black"
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1.5rem] bg-white/80 p-4">
                  <p className="eyebrow">Wishlist</p>
                  <p className="mt-3 text-2xl font-semibold">{wishlist.length}</p>
                </div>
                <div className="rounded-[1.5rem] bg-black p-4 text-white">
                  <p className="eyebrow text-white/[0.45]">Cart</p>
                  <p className="mt-3 text-2xl font-semibold">{cartCount}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
