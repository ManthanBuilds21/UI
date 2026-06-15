import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from '../../components/ui/Reveal'
import { brandValues, editorialMoments } from '../../data/catalog'

export default function AboutPage() {
  return (
    <div className="page-shell pb-8">
      <Reveal
        className="section-frame campaign-surface min-h-[560px] overflow-hidden px-5 py-8 text-white sm:px-8 sm:py-10"
        style={{ backgroundColor: '#111111' }}
      >
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
          <div>
            <p className="eyebrow text-white/[0.45]">About MANTHAN</p>
            <h1 className="mt-5 max-w-5xl text-[4rem] leading-[0.86] sm:text-[6rem] lg:text-[8rem]">
              A premium streetwear brand shaped like an editorial experience.
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/[0.72] sm:text-base">
            MANTHAN was imagined as a fashion label where product, typography, spacing, and movement all work together. It is less storefront, more campaign environment.
          </p>
        </div>
      </Reveal>

      <div className="section-frame mt-10 grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <Reveal className="campaign-surface bg-[var(--beige)] p-6 sm:p-8">
          <div className="ghost-label ghost-outline text-black/[0.16]">Mission</div>
          <p className="mt-8 text-[1.35rem] leading-8 text-black/[0.74] sm:text-[1.55rem] sm:leading-9">
            Our mission is to build modern street culture through sharper silhouettes, disciplined color, and digital experiences that feel cinematic without becoming noisy.
          </p>
        </Reveal>

        <Reveal className="grid gap-6 sm:grid-cols-3">
          {brandValues.map((value) => (
            <article key={value.title} className="campaign-surface bg-[var(--cloud)] p-5 sm:p-6">
              <p className="eyebrow">Value</p>
              <h2 className="mt-4 text-[2rem] leading-[0.92]">{value.title}</h2>
              <p className="mt-4 text-sm leading-7 text-black/[0.68]">{value.description}</p>
            </article>
          ))}
        </Reveal>
      </div>

      <Reveal className="section-frame mt-10 grid gap-6 xl:grid-cols-3">
        {editorialMoments.map((moment) => (
          <article key={moment.title} className="campaign-surface overflow-hidden bg-white">
            <img
              src={moment.image}
              alt={moment.title}
              loading="lazy"
              className="h-[420px] w-full object-cover"
            />
            <div className="p-5 sm:p-6">
              <p className="eyebrow">{moment.location}</p>
              <h2 className="mt-3 text-[2.3rem] leading-[0.92]">{moment.title}</h2>
              <p className="mt-4 text-sm leading-7 text-black/[0.68]">{moment.description}</p>
            </div>
          </article>
        ))}
      </Reveal>

      <Reveal className="section-frame mt-10 campaign-surface bg-[var(--pink)] px-6 py-10 text-white sm:px-8 sm:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-white/[0.55]">Join the world</p>
            <h2 className="mt-4 text-[3.4rem] leading-[0.9] sm:text-[5rem] lg:text-[6rem]">
              Explore the collection that carries the same story into the product.
            </h2>
          </div>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.35] bg-white/[0.14] px-6 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-white backdrop-blur"
          >
            Shop now
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
    </div>
  )
}
