interface SectionHeadingProps {
  eyebrow: string
  title: string
  description: string
  invert?: boolean
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  invert = false,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-4xl">
        <p className={`eyebrow ${invert ? 'text-white/[0.55]' : ''}`}>{eyebrow}</p>
        <h2
          className={`mt-4 max-w-5xl text-[3rem] leading-[0.92] sm:text-[4.5rem] lg:text-[7rem] ${
            invert ? 'text-white' : 'text-black'
          }`}
        >
          {title}
        </h2>
      </div>
      <p className={`section-copy ${invert ? 'text-white/[0.72]' : ''}`}>{description}</p>
    </div>
  )
}
