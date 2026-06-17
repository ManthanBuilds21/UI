import { useDeferredValue, useState, useTransition } from 'react'
import ProductCard from '../../components/cards/ProductCard'
import QuickViewModal from '../../components/ui/QuickViewModal'
import PillTabs from '../../components/ui/PillTabs'
import Reveal, { staggerContainer } from '../../components/ui/Reveal'
import { useCatalog } from '../../hooks/useCatalog'
import type { FilterCategory, Product } from '../../types/catalog'

export default function CollectionsPage() {
  const { categories, collections, products } = useCatalog()
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('All')
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [isPending, startTransition] = useTransition()
  const deferredCategory = useDeferredValue(activeCategory)
  const filteredProducts =
    deferredCategory === 'All'
      ? products
      : products.filter((product) => product.category === deferredCategory)

  return (
    <div className="page-shell pb-8">
      <Reveal
        className="section-frame campaign-surface overflow-hidden px-5 py-8 sm:px-8 sm:py-10"
        style={{ backgroundColor: '#F4F4F4' }}
      >
        <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr] xl:items-end">
          <div>
            <p className="eyebrow">Collections</p>
            <h1 className="mt-5 max-w-4xl text-[4rem] leading-[0.86] sm:text-[6rem] lg:text-[8rem]">
              Shop the full MANTHAN world.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-black/[0.68] sm:text-base">
              Browse every category through the same editorial lens: oversized type, controlled color, strong hierarchy, and product-first campaign composition.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {collections.slice(0, 2).map((collection) => (
              <div key={collection.id} className="rounded-[1.8rem] p-5 text-white" style={{ backgroundColor: collection.background }}>
                <p className="eyebrow text-white/60">{collection.name}</p>
                <p className="mt-4 text-xl font-semibold">{collection.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="section-frame mt-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="eyebrow">Filter by Category</p>
          <h2 className="mt-4 text-[2.8rem] leading-[0.92] sm:text-[4rem]">Curated by silhouette.</h2>
        </div>
        <PillTabs
          active={activeCategory}
          items={categories}
          onChange={(item) => startTransition(() => setActiveCategory(item))}
        />
      </Reveal>

      <Reveal
        variants={staggerContainer}
        className={`section-frame mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3 ${isPending ? 'opacity-70' : ''}`}
      >
        {filteredProducts.map((product) => (
          <Reveal key={product.id}>
            <ProductCard product={product} onQuickView={setQuickViewProduct} />
          </Reveal>
        ))}
      </Reveal>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  )
}
