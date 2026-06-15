import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from '../../components/ui/Reveal'
import { brandValues } from '../../data/catalog'

export default function BrandStorySection() {
  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="section-frame grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Reveal
          className="campaign-surface flex min-h-[680px] flex-col justify-between p-6 text-white sm:p-8 lg:p-10"
          style={{ backgroundColor: '#111111' }}
        >
          <div>
            <p className="eyebrow text-white/[0.45]">Brand Story</p>
            <h2 className="mt-5 max-w-4xl text-[3.8rem] leading-[0.88] sm:text-[5.6rem] lg:text-[7rem]">
              MANTHAN turns streetwear into a visual campaign language.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {brandValues.map((value) => (
              <div key={value.title} className="rounded-[1.6rem] border border-white/[0.12] bg-white/[0.06] p-5">
                <h3 className="text-[1.8rem] leading-[0.92]">{value.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/[0.68]">{value.description}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="campaign-surface relative min-h-[680px] overflow-hidden bg-[var(--beige)] p-6 sm:p-8">
          <div className="ghost-label absolute left-4 top-5 text-black/10 sm:left-6">Journal</div>
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80"
            alt="MANTHAN editorial story"
            loading="lazy"
            className="h-full min-h-[460px] w-full rounded-[1.8rem] object-cover"
          />

          <div className="glass-panel absolute bottom-6 left-6 right-6 p-5 text-black sm:bottom-8 sm:left-8 sm:right-8">
            <p className="eyebrow">From the studio</p>
            <p className="mt-4 max-w-lg text-sm leading-7 text-black/70">
              We build every drop like a campaign: focused, intentional, and designed to be remembered in motion.
            </p>
            <Link to="/about" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em]">
              Read the story
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
