import { useState } from 'react'
import ProductCard from '../../components/cards/ProductCard'
import QuickViewModal from '../../components/ui/QuickViewModal'
import Reveal, { staggerContainer } from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import { useCatalog } from '../../hooks/useCatalog'
import type { Product } from '../../types/catalog'

export default function NewArrivalsSection() {
  const { products } = useCatalog()
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const arrivals = products.slice(0, 4)

  return (
    <section className="page-shell py-10 sm:py-14">
      <Reveal className="section-frame">
        <SectionHeading
          eyebrow="New Arrivals"
          title="Fresh silhouettes with premium construction and clear attitude."
          description="The latest pieces lean into shape, texture, and controlled color, delivering a storefront experience that feels closer to a fashion issue than a product grid."
        />
      </Reveal>

      <Reveal
        variants={staggerContainer}
        className="section-frame mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-4"
      >
        {arrivals.map((product) => (
          <Reveal key={product.id}>
            <ProductCard product={product} onQuickView={setQuickViewProduct} />
          </Reveal>
        ))}
      </Reveal>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </section>
  )
}
