import { useState } from 'react'
import Reveal from '../components/ui/Reveal'
import { ApiError, subscribeToNewsletter } from '../lib/api'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <section className="page-shell py-10 sm:py-14">
      <Reveal className="section-frame campaign-surface bg-[var(--beige)] p-6 sm:p-8 lg:p-12">
        <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div>
            <p className="eyebrow">Newsletter</p>
            <h2 className="mt-4 max-w-4xl text-[3.4rem] leading-[0.88] sm:text-[5.4rem] lg:text-[7rem]">
              Stay close to the next campaign drop.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-black/[0.68] sm:text-base">
              Early access to new capsules, behind-the-scenes editorials, and product stories from the studio.
            </p>
          </div>

          <form
            className="glass-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
            onSubmit={(event) => {
              event.preventDefault()
              setIsSubmitting(true)

              void subscribeToNewsletter(email)
                .then(() => {
                  setEmail('')
                })
                .catch((error) => {
                  window.alert(
                    error instanceof ApiError
                      ? error.message
                      : 'We could not save your subscription right now.',
                  )
                })
                .finally(() => {
                  setIsSubmitting(false)
                })
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="w-full rounded-full border border-black/10 bg-white px-5 py-4 text-sm text-black outline-none placeholder:text-black/40"
            />
            <button type="submit" disabled={isSubmitting} className="button-primary whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </Reveal>
    </section>
  )
}
