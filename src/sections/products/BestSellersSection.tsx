import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'
import { useCatalog } from '../../hooks/useCatalog'
import { formatPrice } from '../../utils/format'

export default function BestSellersSection() {
  const { products } = useCatalog()
  const spotlightProduct = products[3]
  const supportingProducts = [products[4], products[7], products[5]].filter(
    (product): product is NonNullable<typeof product> => Boolean(product),
  )

  if (!spotlightProduct) {
    return null
  }

  return (
    <section className="page-shell py-10 sm:py-14">
      <Reveal className="section-frame">
        <SectionHeading
          eyebrow="Best Sellers"
          title="Pieces people return to because the shape speaks first."
          description="From the campaign-driven cargos to sculptural sneakers and precise outerwear, these are the products that anchor the full story of the brand."
        />
      </Reveal>

      <div className="section-frame mt-10 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Reveal
          className="campaign-surface flex min-h-[620px] flex-col justify-between p-6 sm:p-8 lg:p-10"
          style={{ backgroundColor: spotlightProduct.background }}
        >
          <div className="ghost-label absolute left-4 top-5 text-white/[0.45] sm:left-6">
            {spotlightProduct.ghostText}
          </div>
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-white/60">{spotlightProduct.badge}</p>
              <h3 className="mt-4 text-[3rem] leading-[0.9] text-white sm:text-[4.6rem]">
                {spotlightProduct.name}
              </h3>
            </div>
            <span className="rounded-full border border-white/25 bg-white/[0.12] px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              {formatPrice(spotlightProduct.price)}
            </span>
          </div>

          <div className="relative z-10 flex min-h-[320px] items-end justify-center">
            <img
              src={spotlightProduct.images[0]}
              alt={spotlightProduct.name}
              loading="lazy"
              className="h-[360px] w-full object-contain sm:h-[440px]"
            />
          </div>

          <div className="glass-panel relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-lg text-sm leading-7 text-black/[0.68]">
              {spotlightProduct.story}
            </p>
            <Link to={`/product/${spotlightProduct.slug}`} className="button-primary">
              Explore
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-6">
          {supportingProducts.map((product) => (
            <Reveal key={product.id}>
              <article className="campaign-surface grid min-h-[190px] gap-4 overflow-hidden p-5 sm:grid-cols-[180px_1fr] sm:p-6" style={{ backgroundColor: product.background }}>
                <div className="flex items-end justify-center">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="h-[160px] w-full object-contain"
                  />
                </div>
                <div className="flex flex-col justify-between gap-4">
                  <div>
                    <p className="eyebrow text-white/60">{product.category}</p>
                    <h3 className="mt-3 text-[2.2rem] leading-[0.92] text-white">{product.name}</h3>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="max-w-md text-sm leading-7 text-white/[0.78]">{product.shortDescription}</p>
                    <Link
                      to={`/product/${product.slug}`}
                      className="rounded-full border border-white/[0.28] bg-white/[0.12] px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white backdrop-blur"
                    >
                      {formatPrice(product.price)}
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
