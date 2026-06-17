import { Heart, ShoppingBag, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../../components/cards/ProductCard'
import QuantitySelector from '../../components/ui/QuantitySelector'
import Reveal from '../../components/ui/Reveal'
import { shippingHighlights } from '../../data/catalog'
import { getProductBySlug as getProductBySlugRequest } from '../../lib/api'
import { useCatalog } from '../../hooks/useCatalog'
import { useStore } from '../../hooks/useStore'
import type { Product } from '../../types/catalog'
import { formatPrice } from '../../utils/format'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const { products } = useCatalog()
  const { addToCart, isWishlisted, toggleWishlist } = useStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    let isMounted = true

    void getProductBySlugRequest(slug)
      .then((nextProduct) => {
        if (isMounted) {
          setProduct(nextProduct)
        }
      })
      .catch(() => {
        if (isMounted) {
          setProduct(products[0] ?? null)
        }
      })

    return () => {
      isMounted = false
    }
  }, [products, slug])

  useEffect(() => {
    if (!product) {
      return
    }

    setSelectedImage(0)
    setSelectedSize(product.sizes[0] ?? '')
    setQuantity(1)
  }, [product])

  if (!product) {
    return null
  }

  const relatedProducts = products
    .filter((entry) => entry.slug !== product.slug && entry.collection === product.collection)
    .slice(0, 3)
  const activeSize = selectedSize || product.sizes[0] || ''

  return (
    <div className="page-shell pb-8">
      <div className="section-frame grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Reveal className="grid gap-4 lg:grid-cols-[110px_1fr]">
          <div className="order-2 flex gap-3 overflow-auto lg:order-1 lg:flex-col">
            {product.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`overflow-hidden rounded-[1.5rem] border p-2 transition-colors ${
                  selectedImage === index
                    ? 'border-black bg-black/[0.03]'
                    : 'border-black/[0.08] bg-white'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  className="h-24 w-20 object-cover sm:h-28 sm:w-24"
                />
              </button>
            ))}
          </div>

          <div
            className="campaign-surface group order-1 min-h-[540px] overflow-hidden p-6 sm:p-8 lg:order-2"
            style={{ backgroundColor: product.background }}
          >
            <div className="ghost-label absolute left-4 top-5 text-white/[0.48] sm:left-6">
              {product.ghostText}
            </div>
            <div className="relative flex min-h-[520px] items-end justify-center">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-[420px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.05] sm:h-[620px]"
              />
            </div>
          </div>
        </Reveal>

        <Reveal className="rounded-[2rem] bg-white p-2 sm:p-4 xl:p-8">
          <p className="eyebrow">{product.collection}</p>
          <h1 className="mt-4 text-[3.6rem] leading-[0.88] sm:text-[5rem] lg:text-[6.2rem]">
            {product.name}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-black px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              {product.badge}
            </span>
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
          </div>

          <p className="mt-6 max-w-xl text-sm leading-7 text-black/[0.68] sm:text-base">
            {product.description}
          </p>

          <div className="mt-10">
            <p className="eyebrow">Select Size</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {product.sizes.map((size) => {
                const active = size === selectedSize

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] transition-colors ${
                      active
                        ? 'bg-black text-white'
                        : 'border border-black/10 bg-black/[0.02] text-black/70 hover:text-black'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <button
              type="button"
              onClick={() => void addToCart(product.id, activeSize, quantity)}
              className="button-primary flex-1"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => void toggleWishlist(product.id)}
              className={`flex items-center justify-center rounded-full border px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] transition-colors ${
                isWishlisted(product.id)
                  ? 'border-black bg-black text-white'
                  : 'border-black/10 bg-white text-black/[0.72] hover:text-black'
              }`}
            >
              <Heart className={`mr-2 h-4 w-4 ${isWishlisted(product.id) ? 'fill-current' : ''}`} />
              Wishlist
            </button>
          </div>

          <div className="mt-10 grid gap-5 rounded-[1.8rem] bg-[var(--cloud)] p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="eyebrow">Fit</p>
                <p className="mt-3 text-sm leading-7 text-black/[0.72]">{product.fit}</p>
              </div>
              <div>
                <p className="eyebrow">Material</p>
                <p className="mt-3 text-sm leading-7 text-black/[0.72]">{product.material}</p>
              </div>
            </div>

            <div>
              <p className="eyebrow">Product Features</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {product.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black/[0.65]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {shippingHighlights.map((highlight) => (
                <div key={highlight} className="rounded-[1.4rem] bg-white p-4">
                  <Truck className="h-4 w-4 text-black/[0.55]" />
                  <p className="mt-3 text-sm leading-7 text-black/70">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.24em] text-black/[0.52]">
            <span>Colors: {product.colors.join(' / ')}</span>
            <Link to="/collections" className="text-black">
              Back to collections
            </Link>
          </div>
        </Reveal>
      </div>

      <Reveal className="section-frame mt-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Product Story</p>
            <h2 className="mt-4 text-[3rem] leading-[0.92] sm:text-[4.4rem]">
              A luxury product view grounded in movement.
            </h2>
          </div>
          <p className="section-copy">{product.story}</p>
        </div>
      </Reveal>

      <Reveal className="section-frame mt-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Related Products</p>
            <h2 className="mt-4 text-[2.8rem] leading-[0.92] sm:text-[4rem]">More from the same world.</h2>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </Reveal>
    </div>
  )
}
