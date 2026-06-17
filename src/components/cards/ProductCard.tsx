import { motion } from 'framer-motion'
import { ArrowUpRight, Eye, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../../hooks/useStore'
import type { Product } from '../../types/catalog'
import { formatPrice } from '../../utils/format'

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useStore()
  const wishlisted = isWishlisted(product.id)

  return (
    <motion.article
      layout
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="product-card group"
    >
      <div
        className="relative overflow-hidden px-5 pb-4 pt-5 sm:px-6 sm:pt-6"
        style={{ backgroundColor: product.background }}
      >
        <div className="absolute inset-0 noise-mask opacity-70" />
        <div className="absolute left-4 top-3 font-display text-[3.7rem] uppercase leading-none text-white/[0.55] sm:left-6 sm:top-4 sm:text-[4.8rem]">
          {product.ghostText}
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <span className="rounded-full border border-black/10 bg-white/70 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/70 backdrop-blur">
            {product.badge}
          </span>
          <button
            type="button"
            onClick={() => void toggleWishlist(product.id)}
            className="rounded-full border border-black/10 bg-white/70 p-3 text-black/70 backdrop-blur transition-colors hover:text-black"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="relative z-10 mt-10 flex min-h-[280px] items-end justify-center sm:min-h-[360px]">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-[280px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.04] sm:h-[360px]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{product.category}</p>
            <h3 className="mt-3 text-[2rem] leading-[0.92] sm:text-[2.5rem]">{product.name}</h3>
          </div>
          <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
        </div>

        <p className="text-sm leading-7 text-black/[0.68]">{product.shortDescription}</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to={`/product/${product.slug}`} className="button-primary flex-1">
            View Product
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
          {onQuickView ? (
            <button type="button" onClick={() => onQuickView(product)} className="button-secondary">
              <Eye className="mr-2 h-4 w-4" />
              Quick View
            </button>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}
