import { ArrowRight, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import QuantitySelector from '../../components/ui/QuantitySelector'
import Reveal from '../../components/ui/Reveal'
import { useCatalog } from '../../hooks/useCatalog'
import { useStore } from '../../hooks/useStore'
import { formatPrice } from '../../utils/format'

export default function CartPage() {
  const { products, isLoading: isCatalogLoading } = useCatalog()
  const { cart, subtotal, updateCartItem, removeCartItem, checkout, isMutating } = useStore()
  const shipping = cart.length === 0 || subtotal >= 180 ? 0 : 18
  const total = subtotal + shipping

  const cartLines = cart
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId)
      if (!product) return null

      return { item, product }
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  if (cart.length > 0 && cartLines.length === 0 && isCatalogLoading) {
    return null
  }

  return (
    <div className="page-shell pb-8">
      <Reveal className="section-frame">
        <p className="eyebrow">Cart</p>
        <h1 className="mt-5 text-[4rem] leading-[0.86] sm:text-[6rem] lg:text-[8rem]">
          Your campaign selection.
        </h1>
      </Reveal>

      {cartLines.length === 0 ? (
        <Reveal className="section-frame mt-10 campaign-surface bg-[var(--cloud)] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr] xl:items-end">
            <div>
              <div className="ghost-label ghost-outline text-black/[0.16]">Empty</div>
              <p className="mt-6 max-w-xl text-sm leading-7 text-black/[0.68] sm:text-base">
                Your cart is ready for product. Add hoodies, cargos, outerwear, or sneakers from the collections page to see the full luxury cart layout in action.
              </p>
            </div>
            <Link to="/collections" className="button-primary justify-center sm:w-fit">
              Browse collections
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="section-frame mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6">
            {cartLines.map(({ item, product }) => (
              <Reveal key={`${item.productId}-${item.size}`}>
                <article className="campaign-surface grid gap-4 overflow-hidden bg-white p-5 sm:grid-cols-[180px_1fr] sm:p-6">
                  <div
                    className="flex items-end justify-center rounded-[1.5rem] p-4"
                    style={{ backgroundColor: product.background }}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-[160px] w-full object-contain"
                    />
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">{product.category}</p>
                        <h2 className="mt-3 text-[2.2rem] leading-[0.92]">{product.name}</h2>
                        <p className="mt-3 text-sm leading-7 text-black/[0.68]">Size: {item.size}</p>
                      </div>
                      <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(value) => void updateCartItem(item.productId, item.size, value)}
                      />
                      <button
                        type="button"
                        onClick={() => void removeCartItem(item.productId, item.size)}
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-black/[0.52]"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="campaign-surface h-fit bg-black p-6 text-white sm:p-8">
            <p className="eyebrow text-white/[0.45]">Summary</p>
            <h2 className="mt-4 text-[2.8rem] leading-[0.92] sm:text-[3.6rem]">Checkout UI</h2>

            <div className="mt-8 grid gap-4 text-sm uppercase tracking-[0.24em] text-white/[0.64]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="text-white">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.12] pt-4 text-white">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                const order = await checkout()

                if (order) {
                  window.alert(`Order ${order.id} created successfully.`)
                }
              }}
              disabled={isMutating}
              className="button-primary mt-8 w-full justify-center bg-white text-black"
            >
              Proceed to checkout
            </button>

            <p className="mt-5 text-sm leading-7 text-white/[0.62]">
              Checkout now creates a real order for your account and clears the saved cart after purchase.
            </p>
          </Reveal>
        </div>
      )}
    </div>
  )
}
