import { Link } from 'react-router-dom'
import { WhatsAppIcon } from './icons'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-(--color-border) bg-(--color-bg)/95 px-6 py-4.5 backdrop-blur">
      <div className="flex shrink-0 items-center gap-5">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span
            className="block h-5 w-5 shrink-0 bg-(--color-accent)"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          />
          <span className="whitespace-nowrap font-mono text-[17px] font-bold tracking-tight text-(--color-ink)">
            Carvex 3D
          </span>
        </Link>
        <nav className="flex shrink-0 gap-4 text-[13px] font-medium whitespace-nowrap text-(--color-ink-dim)">
          <Link to="/browse" className="hover:text-(--color-ink)">
            Browse
          </Link>
          <span className="cursor-default opacity-70">Categories</span>
          <span className="cursor-default opacity-70">Shops</span>
          <span className="cursor-default opacity-70">Machining Guide</span>
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-3.5">
        <a
          href="https://wa.me/15551234567"
          className="icon-btn icon-btn-sm shrink-0 text-[13px] font-bold"
          style={{ background: 'var(--color-green)', color: 'oklch(0.98 0.01 145)' }}
        >
          <WhatsAppIcon />
          <span className="icon-btn-label">Message on WhatsApp</span>
        </a>
      </div>
    </header>
  )
}
