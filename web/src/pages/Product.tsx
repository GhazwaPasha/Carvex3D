import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import ThreeDStage from '../components/ThreeDStage'
import { getProductById, getProductDetails } from '../data/products'
import { useDemoMachinedPart } from '../hooks/useDemoMachinedPart'
import type { ThreeDStageElement } from '../lib/three-d-stage'

export default function Product() {
  const { id } = useParams<{ id: string }>()
  const stageRef = useRef<ThreeDStageElement>(null)
  useDemoMachinedPart(stageRef)

  const product = id ? getProductById(id) : undefined

  if (!product) {
    return (
      <div className="min-h-screen bg-[oklch(0.14_0.004_60)] text-(--color-ink)">
        <Header />
        <div className="mx-auto max-w-[1100px] px-12 py-24 text-center">
          <h1 className="mb-4 text-2xl font-bold">Part not found</h1>
          <Link to="/browse" className="text-(--color-accent) underline">
            Back to Browse
          </Link>
        </div>
      </div>
    )
  }

  const { description, specs, files } = getProductDetails(product)

  return (
    <div className="min-h-screen bg-[rgb(24,27,31)] text-(--color-ink)">
      <Header />

      {/* 3D hero */}
      <div className="relative h-[78vh] w-full overflow-hidden border-b border-(--color-border-soft) bg-[rgb(24,27,31)]">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <ThreeDStage ref={stageRef} name={product.id} background="transparent" className="relative block h-full w-full" />
        <div className="pointer-events-none absolute top-6 left-8 font-mono text-xs text-(--color-ink-dimmer)">
          <Link to="/browse" className="pointer-events-auto hover:text-(--color-ink)">
            Browse
          </Link>{' '}
          / {product.category}
        </div>
        <div className="pointer-events-none absolute bottom-7 left-8">
          <div className="mb-2 font-mono text-[11px] font-semibold tracking-[0.08em] text-(--color-accent) uppercase">
            {product.format} · {product.category}
          </div>
          <h1 className="text-[34px] font-extrabold tracking-tight">{product.name}</h1>
        </div>
        <div className="pointer-events-none absolute right-8 bottom-7 font-mono text-[11px] text-(--color-ink-dimmer)">
          drag to orbit · scroll to zoom
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-12 pt-14 pb-24">
        <div className="grid grid-cols-1 gap-18 lg:grid-cols-[1fr_340px]">
          {/* Details */}
          <div>
            <div className="mb-8 flex items-center gap-2 text-[13px] text-(--color-ink-dim)">
              by <span className="text-(--color-ink)">{product.creator}</span>
              <span className="text-(--color-ink-dimmer)">·</span>
              <div className="flex items-center gap-1">
                <span className="h-[9px] w-[9px] bg-(--color-accent)" />
                {product.rating}
              </div>
            </div>

            <p className="mb-12 max-w-[560px] text-[15px] leading-relaxed text-(--color-ink-dim)">{description}</p>

            <h2 className="mb-5 text-[15px] font-bold tracking-tight text-(--color-ink-dimmer) uppercase">Specifications</h2>
            <div className="border-t border-(--color-border-soft)">
              {specs?.map((s) => (
                <div key={s.label} className="flex border-b border-(--color-border-soft) py-3.5 text-sm">
                  <div className="w-[190px] shrink-0 font-mono text-(--color-ink-dimmer)">{s.label}</div>
                  <div className="text-(--color-ink)">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Buy box */}
          <div className="self-start lg:sticky lg:top-24">
            <div className="mb-6 flex flex-col gap-2.5">
              <a
                href={`https://wa.me/15551234567?text=Hi%2C%20I%27m%20interested%20in%20the%20${encodeURIComponent(product.name)}`}
                className="rounded bg-(--color-accent) py-3.5 text-center text-[15px] font-bold text-(--color-bg)"
              >
                Order on WhatsApp
              </a>
            </div>

            <div className="mb-5 rounded-md border border-(--color-border-soft) p-4.5">
              <div className="mb-3 font-mono text-xs font-bold tracking-[0.06em] text-(--color-ink-dimmer) uppercase">
                Included files
              </div>
              {files?.map((f) => (
                <div key={f.name} className="flex items-center justify-between py-1.5 font-mono text-xs text-(--color-ink)">
                  <span>{f.name}</span>
                  <span className="text-(--color-ink-dimmer)">{f.size}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2.5 rounded-md border border-(--color-border-soft) p-3.5">
              <div className="h-9.5 w-9.5 shrink-0 rounded bg-(--color-bg-panel)" />
              <div>
                <div className="text-[13px] font-semibold">{product.creator}</div>
                <div className="text-xs text-(--color-ink-dimmer)">180 designs · 8,400 downloads</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
