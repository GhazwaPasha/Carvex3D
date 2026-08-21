import { useMemo, useState } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import { categories, fileFormats, materials, products } from '../data/products'

export default function Browse() {
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set())
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const [activeMaterials, setActiveMaterials] = useState<Set<string>>(new Set())

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, value: string) => {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    setter(next)
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeCategories.size && !activeCategories.has(p.category)) return false
      if (activeFormats.size && !activeFormats.has(p.format)) return false
      if (activeMaterials.size) {
        const matchesMaterial = [...activeMaterials].some((m) => p.material.toLowerCase().includes(m.split(' ')[0].toLowerCase()))
        if (!matchesMaterial) return false
      }
      return true
    })
  }, [activeCategories, activeFormats, activeMaterials])

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-ink)">
      <Header />

      <div className="mx-auto flex max-w-[1400px] gap-10 px-12 py-8">
        <aside className="w-60 shrink-0">
          <div className="mb-4 font-mono text-xs font-semibold tracking-[0.08em] text-(--color-ink-dimmer) uppercase">
            Filters
          </div>

          <FilterGroup label="Category" options={categories} active={activeCategories} onToggle={(v) => toggle(activeCategories, setActiveCategories, v)} />
          <FilterGroup label="File format" options={[...fileFormats]} active={activeFormats} onToggle={(v) => toggle(activeFormats, setActiveFormats, v)} />
          <FilterGroup label="Material" options={materials} active={activeMaterials} onToggle={(v) => toggle(activeMaterials, setActiveMaterials, v)} />
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex items-baseline justify-between">
            <div>
              <h1 className="mb-1 text-2xl font-bold tracking-tight">All parts</h1>
              <div className="font-mono text-[13px] text-(--color-ink-dimmer)">{filtered.length} results</div>
            </div>
            <div className="flex items-center gap-2 rounded border border-(--color-border) bg-(--color-bg-panel) px-3.5 py-2">
              <span className="text-[13px] text-(--color-ink-dim)">Sort: Most popular</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-24 text-center text-(--color-ink-dimmer)">No parts match those filters.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterGroup({
  label,
  options,
  active,
  onToggle,
}: {
  label: string
  options: string[]
  active: Set<string>
  onToggle: (value: string) => void
}) {
  return (
    <div className="mb-7">
      <div className="mb-3 text-[13px] font-semibold">{label}</div>
      {options.map((opt) => (
        <label key={opt} className="mb-2.5 flex cursor-pointer items-center gap-2.5 text-[13px] text-(--color-ink-dim)">
          <input
            type="checkbox"
            checked={active.has(opt)}
            onChange={() => onToggle(opt)}
            className="h-3.5 w-3.5 shrink-0 rounded-[3px] border-[1.5px] border-(--color-ink-dimmer) accent-(--color-accent)"
          />
          {opt}
        </label>
      ))}
    </div>
  )
}
