import Reveal, { staggerContainer } from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'
import { editorialMoments, lookbookNotes } from '../data/catalog'

export default function LookbookSection() {
  return (
    <section className="page-shell py-10 sm:py-14">
      <Reveal className="section-frame">
        <SectionHeading
          eyebrow="Lookbook"
          title="A digital fashion spread built around posture, pace, and color."
          description="The lookbook keeps the storytelling immersive, showing how product, attitude, and environment work together across the wider brand world."
        />
      </Reveal>

      <Reveal
        variants={staggerContainer}
        className="section-frame mt-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"
      >
        <Reveal className="grid gap-6 sm:grid-cols-2">
          {editorialMoments.slice(0, 2).map((moment) => (
            <article key={moment.title} className="campaign-surface overflow-hidden bg-[var(--cloud)]">
              <img
                src={moment.image}
                alt={moment.title}
                loading="lazy"
                className="h-[420px] w-full object-cover"
              />
              <div className="p-5 sm:p-6">
                <p className="eyebrow">{moment.location}</p>
                <h3 className="mt-3 text-[2.3rem] leading-[0.92]">{moment.title}</h3>
                <p className="mt-4 text-sm leading-7 text-black/[0.68]">{moment.description}</p>
              </div>
            </article>
          ))}
        </Reveal>

        <Reveal className="campaign-surface flex min-h-[420px] flex-col justify-between bg-[var(--cloud)] p-6 sm:p-8">
          <div>
            <div className="ghost-label ghost-outline text-black/20">Issue</div>
            <p className="eyebrow mt-6">Styling Notes</p>
          </div>

          <div className="grid gap-5">
            {lookbookNotes.map((note, index) => (
              <div key={note} className="rounded-[1.5rem] border border-black/10 bg-white/70 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/[0.48]">
                  0{index + 1}
                </p>
                <p className="mt-3 text-base leading-7 text-black/[0.72]">{note}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Reveal>
    </section>
  )
}
