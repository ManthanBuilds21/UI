import { motion } from 'framer-motion'
import type { FilterCategory } from '../../types/catalog'

interface PillTabsProps {
  active: FilterCategory
  items: FilterCategory[]
  onChange: (item: FilterCategory) => void
}

export default function PillTabs({ active, items, onChange }: PillTabsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => {
        const isActive = item === active

        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`relative rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] transition-colors duration-300 ${
              isActive ? 'text-white' : 'border border-black/10 bg-white text-black/[0.72] hover:text-black'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="active-filter"
                className="absolute inset-0 rounded-full bg-black"
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              />
            )}
            <span className="relative z-10">{item}</span>
          </button>
        )
      })}
    </div>
  )
}
