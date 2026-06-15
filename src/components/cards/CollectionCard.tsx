import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CollectionSpotlight } from '../../types/catalog'

interface CollectionCardProps {
  collection: CollectionSpotlight
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="campaign-surface group min-h-[540px] p-6 sm:p-8"
      style={{ backgroundColor: collection.background }}
    >
      <div className="absolute inset-0 noise-mask opacity-60" />
      <div className="ghost-label absolute left-4 top-5 text-white/[0.45] sm:left-6">
        {collection.ghostText}
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-white/[0.55]">{collection.category}</p>
            <h3 className="mt-4 text-[2.8rem] leading-[0.92] text-white sm:text-[4rem]">
              {collection.name}
            </h3>
          </div>
          <Link
            to="/collections"
            className="rounded-full border border-white/[0.35] bg-white/[0.14] p-3 text-white backdrop-blur transition-transform duration-300 group-hover:translate-x-1"
            aria-label={`Explore ${collection.name}`}
          >
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="relative my-8 flex flex-1 items-end justify-center">
          <img
            src={collection.heroImage}
            alt={collection.name}
            loading="lazy"
            className="h-[260px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.04] sm:h-[340px]"
          />
        </div>

        <div className="glass-panel relative z-10 max-w-xl p-5 text-black">
          <p className="text-sm leading-7 text-black/[0.68]">{collection.description}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-black/[0.55]">
            {collection.tagline}
          </p>
        </div>
      </div>
    </motion.article>
  )
}
