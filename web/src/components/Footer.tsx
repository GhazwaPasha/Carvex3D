import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1400px] justify-between border-t border-(--color-border) p-12 font-mono text-[13px] text-(--color-ink-dimmer)">
      <div className="text-base font-bold text-(--color-ink)">Carvex 3D</div>
      <div className="flex gap-8">
        <Link to="/browse" className="hover:text-(--color-ink)">
          Browse
        </Link>
        <span className="cursor-default opacity-70">Sell</span>
        <span className="cursor-default opacity-70">Help</span>
        <span className="cursor-default opacity-70">Terms</span>
      </div>
    </footer>
  )
}
