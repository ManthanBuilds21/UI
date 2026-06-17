import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../hooks/useCatalog'

const HERO_TITLES = [
  'Built For The Streets',
  'Wear The Future',
  'Beyond Ordinary',
  'Modern Street Culture',
]

export default function HeroCarousel() {
  const { collections, products } = useCatalog()
  const [activeIndex, setActiveIndex] = useState(0)
  const activeCollection = collections[activeIndex]
  const featuredProduct = activeCollection
    ? products.find((product) => product.slug === activeCollection.productSlugs[0])
    : null

  useEffect(() => {
    if (collections.length === 0) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % collections.length)
    }, 5200)

    return () => window.clearInterval(timer)
  }, [collections.length])

  useEffect(() => {
    if (activeIndex >= collections.length) {
      setActiveIndex(0)
    }
  }, [activeIndex, collections.length])

  const goTo = (direction: 'next' | 'prev') => {
    setActiveIndex((current) =>
      direction === 'next'
        ? (current + 1) % collections.length
        : (current + collections.length - 1) % collections.length,
    )
  }

  if (!activeCollection || !featuredProduct) return null

  return (
    <section className="page-shell">
      <div
        className="section-frame campaign-surface min-h-[calc(100vh-7rem)] px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8 lg:px-10"
        style={{ backgroundColor: activeCollection.background }}
      >
        <div className="grid min-h-[calc(100vh-9rem)] gap-8 lg:grid-cols-[0.82fr_1.18fr_0.62fr] lg:items-end">
          <div className="relative z-10 flex flex-col justify-between gap-8 pt-16 sm:pt-20 lg:pt-28">
            <div>
              <p className="eyebrow text-white/60">MANTHAN Clothing / 2026 Drop</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCollection.id}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h1 className="mt-5 max-w-md text-[4.4rem] leading-[0.86] text-white sm:text-[6rem] lg:text-[7.8rem]">
                    {HERO_TITLES[activeIndex]}
                  </h1>
                  <p className="mt-5 max-w-md text-sm leading-7 text-white/[0.78] sm:text-base">
                    {activeCollection.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Link to="/collections" className="button-primary bg-white text-black hover:text-black">
                Shop Collection
              </Link>
              <Link
                to={`/product/${featuredProduct.slug}`}
                className="button-secondary border-white/[0.35] bg-white/[0.14] text-white hover:bg-white/[0.22]"
              >
                View Product
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-[360px] items-end justify-center lg:min-h-[700px]">
            <div className="ghost-label absolute inset-x-0 top-6 text-center text-white/50 lg:top-10">
              {activeCollection.ghostText}
            </div>
            <AnimatePresence mode="wait">
              <motion.img
                key={featuredProduct.id}
                src={featuredProduct.images[0]}
                alt={featuredProduct.name}
                className="relative z-10 h-[360px] w-full object-contain sm:h-[500px] lg:h-[760px]"
                initial={{ y: 24, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
          </div>

          <div className="relative z-10 flex flex-col justify-between gap-8 pb-2 lg:pb-6">
            <div className="glass-panel ml-auto max-w-sm p-5 text-black sm:p-6">
              <p className="eyebrow">Featured Product</p>
              <h2 className="mt-4 text-[2rem] leading-[0.92] sm:text-[2.6rem]">
                {featuredProduct.name}
              </h2>
              <p className="mt-4 text-sm leading-7 text-black/[0.68]">
                {featuredProduct.shortDescription}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => goTo('prev')}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/[0.12] text-white backdrop-blur transition-transform duration-300 hover:scale-105"
                  aria-label="Previous slide"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo('next')}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/[0.12] text-white backdrop-blur transition-transform duration-300 hover:scale-105"
                  aria-label="Next slide"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              <div className="w-full max-w-[200px]">
                <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.24em] text-white/[0.65]">
                  <span>{activeCollection.name}</span>
                  <span>
                    {String(activeIndex + 1).padStart(2, '0')} / {String(collections.length).padStart(2, '0')}
                  </span>
                </div>
                <div className="h-[2px] overflow-hidden rounded-full bg-white/20">
                  <motion.div
                    key={activeCollection.id}
                    className="h-full rounded-full bg-white"
                    initial={{ scaleX: 0, transformOrigin: 'left' }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 5.2, ease: 'linear' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
