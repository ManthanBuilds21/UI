import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

export default function QuantitySelector({ value, onChange, max = 99 }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-4 rounded-full border border-black/10 bg-white px-4 py-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, Math.min(max, value - 1)))}
        className="rounded-full p-1 text-black/70 transition-colors hover:text-black"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-6 text-center text-sm font-semibold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, Math.min(max, value + 1)))}
        className="rounded-full p-1 text-black/70 transition-colors hover:text-black"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
