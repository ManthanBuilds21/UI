import { useDeferredValue, useState, useTransition, useMemo } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import ProductCard from '../../components/cards/ProductCard'
import QuickViewModal from '../../components/ui/QuickViewModal'
import PillTabs from '../../components/ui/PillTabs'
import Reveal, { staggerContainer } from '../../components/ui/Reveal'
import SEO from '../../components/seo/SEO'
import { useCatalog } from '../../hooks/useCatalog'
import type { FilterCategory, Product } from '../../types/catalog'

export default function CollectionsPage() {
  const { categories, collections, products } = useCatalog()
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<'newest' | 'price-asc' | 'price-desc'>('newest')
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [isPending, startTransition] = useTransition()
  
  const deferredCategory = useDeferredValue(activeCategory)
  const deferredSearch = useDeferredValue(searchQuery)
  
  const filteredProducts = useMemo(() => {
    let result = products

    if (deferredCategory !== 'All') {
      result = result.filter((product) => product.category === deferredCategory)
    }

    if (deferredSearch.trim()) {
      const query = deferredSearch.toLowerCase()
      result = result.filter((product) => product.name.toLowerCase().includes(query))
    }

    return [...result].sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price
      if (sortOption === 'price-desc') return b.price - a.price
      // 'newest' fallback (we don't have createdAt on catalog products locally, so we'll just keep original order or by id)
      return b.id.localeCompare(a.id)
    })
  }, [products, deferredCategory, deferredSearch, sortOption])

  return (
    <div className="page-shell pb-8">
      <SEO 
        title="MANTHAN | Collections" 
        description="Shop the full MANTHAN world. Browse our oversized silhouettes and curated editorial fashion." 
      />
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
        <div className="flex-1">
          <p className="eyebrow">Filter by Category</p>
          <h2 className="mt-4 text-[2.8rem] leading-[0.92] sm:text-[4rem]">Curated by silhouette.</h2>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-black/10 bg-white py-3 pl-10 pr-5 text-sm outline-none focus:border-black/30 sm:w-[240px]"
            />
          </div>
          
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="w-full appearance-none rounded-full border border-black/10 bg-white py-3 pl-5 pr-10 text-sm outline-none focus:border-black/30 sm:w-auto cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-black/40" />
          </div>
        </div>
      </Reveal>

      <Reveal className="section-frame mt-6">
        <PillTabs
          active={activeCategory}
          items={categories}
          onChange={(item) => startTransition(() => setActiveCategory(item as FilterCategory))}
        />
      </Reveal>

      <Reveal
        variants={staggerContainer}
        className={`section-frame mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3 ${isPending ? 'opacity-70' : ''}`}
      >
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-lg text-black/60">No products found matching your criteria.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Reveal key={product.id}>
              <ProductCard product={product} onQuickView={setQuickViewProduct} />
            </Reveal>
          ))
        )}
      </Reveal>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  )
}
