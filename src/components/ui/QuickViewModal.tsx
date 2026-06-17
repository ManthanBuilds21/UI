import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStore } from '../../hooks/useStore'
import type { Product } from '../../types/catalog'
import { formatPrice } from '../../utils/format'

interface QuickViewModalProps {
  product: Product | null
  onClose: () => void
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart } = useStore()
  const [selectedSize, setSelectedSize] = useState('')

  useEffect(() => {
    setSelectedSize(product?.sizes[0] ?? '')
  }, [product])

  return (
    <AnimatePresence>
      {product ? (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/[0.45] px-4 py-8 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="section-frame grid max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-[0_32px_120px_rgba(17,17,17,0.22)] lg:grid-cols-[1.05fr_0.95fr]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="relative flex min-h-[340px] items-end justify-center overflow-hidden p-6 sm:p-10"
              style={{ backgroundColor: product.background }}
            >
              <div className="ghost-label absolute left-6 top-8 text-black/[0.18]">
                {product.ghostText}
              </div>
              <img
                src={product.images[0]}
                alt={product.name}
                className="relative z-10 h-[320px] w-full object-contain sm:h-[420px]"
              />
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{product.collection}</p>
                  <h3 className="mt-4 text-[2.4rem] leading-[0.92] sm:text-[3.5rem]">
                    {product.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-black/10 p-3 text-black/70 transition-colors hover:text-black"
                  aria-label="Close quick view"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 text-sm text-black/[0.55]">{product.badge}</p>
              <p className="mt-6 text-xl font-semibold">{formatPrice(product.price)}</p>
              <p className="mt-5 text-sm leading-7 text-black/[0.68]">{product.description}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                {product.sizes.map((size) => {
                  const active = size === selectedSize

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition-colors ${
                        active
                          ? 'bg-black text-white'
                          : 'border border-black/[0.12] bg-black/[0.03] text-black/[0.72] hover:text-black'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    void addToCart(product.id, selectedSize || product.sizes[0] || '', 1)
                  }
                  className="button-primary"
                >
                  Add to cart
                </button>
                <Link to={`/product/${product.slug}`} onClick={onClose} className="button-secondary">
                  Full details
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
