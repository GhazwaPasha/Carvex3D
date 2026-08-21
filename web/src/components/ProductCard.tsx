import { Link } from 'react-router-dom'
import type { Product } from '../types/product'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="block overflow-hidden rounded-md border border-(--color-border) bg-(--color-bg-raised)"
    >
      <div className="relative flex aspect-square items-center justify-center bg-[repeating-linear-gradient(135deg,oklch(0.23_0.006_60),oklch(0.23_0.006_60)_10px,oklch(0.2_0.006_60)_10px,oklch(0.2_0.006_60)_20px)]">
        <span className="rounded bg-(--color-bg) px-2.5 py-1 font-mono text-[11px] text-(--color-ink-dimmer)">
          part render
        </span>
        <div className="absolute top-2.5 left-2.5 rounded bg-(--color-bg)/90 px-2.5 py-1 font-mono text-[11px] font-semibold text-(--color-accent)">
          {product.format}
        </div>
      </div>
      <div className="p-4">
        <div className="mb-1 text-[15px] font-bold tracking-tight">{product.name}</div>
        <div className="mb-1.5 font-mono text-xs text-(--color-ink-dimmer)">{product.material}</div>
        <div className="mb-3 text-[13px] text-(--color-ink-dimmer)">{product.creator}</div>
        <div className="flex items-center gap-1 text-[13px] text-(--color-ink-dimmer)">
          <span className="h-[9px] w-[9px] bg-(--color-accent)" />
          {product.rating}
        </div>
      </div>
    </Link>
  )
}
