import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ThreeDStage from '../components/ThreeDStage'
import { GridIcon, PencilIcon, WhatsAppIcon, YouTubeIcon } from '../components/icons'
import { useHeroScroll } from '../hooks/useHeroScroll'
import { useCarvedLegHero } from '../hooks/useCarvedLegHero'
import type { ThreeDStageElement } from '../lib/three-d-stage'

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<ThreeDStageElement>(null)
  const v = useHeroScroll(heroRef)
  useCarvedLegHero(stageRef, v.gearP)

  return (
    <div className="min-h-screen bg-[rgb(24,27,31)] text-(--color-ink)">
      <Header />

      {/* Scroll-driven 3D hero — same 930vh-tall sticky-viewport trick as the
          original design, now driving the 3D scene directly instead of via
          a postMessage'd iframe. */}
      <div ref={heroRef} className="relative" style={{ height: '930vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden bg-[rgb(24,27,31)]">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 30% 40%, oklch(0.32 0.03 240), oklch(0.16 0.01 240) 70%)',
              opacity: v.section1Opacity,
              transition: 'opacity 0.4s linear',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 70% 60%, oklch(0.3 0.03 300), oklch(0.14 0.01 260) 70%)',
              opacity: v.section2Opacity,
              transition: 'opacity 0.4s linear',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 30% 60%, oklch(0.32 0.09 25), oklch(0.15 0.02 25) 70%)',
              opacity: v.section3Opacity,
              transition: 'opacity 0.4s linear',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, oklch(0.32 0.08 145), oklch(0.15 0.02 145) 70%)',
              opacity: v.section4Opacity,
              transition: 'opacity 0.4s linear',
            }}
          />
          <div className="absolute inset-0 bg-black" style={{ opacity: v.introOpacity }} />

          <div
            className="absolute top-19 left-0 h-[calc(100%-76px)] w-[58%]"
            style={{ transform: `translateX(${v.introOffsetVw}vw)`, transition: 'transform 0.05s linear' }}
          >
            <ThreeDStage
              ref={stageRef}
              name="carved_leg"
              background="transparent"
              hideToolbar
              className="pointer-events-none block h-full w-full"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/55" style={{ opacity: v.introOpacity }} />
          </div>

          <div className="bg-grid pointer-events-none absolute inset-0" />

          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center px-[10%]"
            style={{ opacity: v.introOpacity }}
          >
            <blockquote className="m-0 max-w-[980px] p-0 text-center">
              <span className="mb-2 block font-display text-7xl leading-none font-extrabold text-(--color-accent)">
                &ldquo;
              </span>
              <p className="mx-auto max-w-[700px] text-center text-[38px] leading-[1.35] font-bold tracking-tight text-(--color-ink)">
                Your CNC machine is only as good as the designs you give it.&rdquo;
              </p>
            </blockquote>
          </div>

          <HeroPanel
            eyebrow="01 — Ready-made"
            eyebrowColor="var(--color-accent)"
            title="Browse Library"
            body="Toleranced, shop-tested CAD files ready to mill or lathe today."
            opacity={v.section1Opacity}
            y={v.section1Y}
            pointerEvents="none"
          >
            <Link to="/browse" className="icon-btn bg-(--color-accent-strong) pointer-events-auto text-[15px] font-bold text-[oklch(0.14_0.004_60)]">
              <GridIcon />
              <span className="icon-btn-label">Browse Library</span>
            </Link>
          </HeroPanel>

          <HeroPanel
            eyebrow="02 — Made to spec"
            eyebrowColor="var(--color-accent)"
            title="Custom Designs"
            body="Send your specs — we model, tolerance, and hand off a part built for your machine."
            opacity={v.section2Opacity}
            y={v.section2Y}
            pointerEvents="none"
          >
            <a
              href="https://wa.me/15551234567?text=Hi%2C%20I%27d%20like%20a%20custom%20design"
              className="icon-btn text-[15px] font-bold text-[oklch(0.14_0.004_60)]"
              style={{ background: 'var(--color-violet)', pointerEvents: v.section2Pointer }}
            >
              <PencilIcon />
              <span className="icon-btn-label">Request a Design</span>
            </a>
          </HeroPanel>

          <HeroPanel
            eyebrow="03 — Learn the craft"
            eyebrowColor="oklch(0.7 0.15 25)"
            title="YouTube Tutorials"
            body="Setup sheets, fixturing tips, and full machining walkthroughs on our channel."
            opacity={v.section3Opacity}
            y={v.section3Y}
            pointerEvents={v.section3Pointer}
          >
            <a
              href="#"
              className="icon-btn pointer-events-auto text-[15px] font-bold"
              style={{ background: 'var(--color-orange)', color: 'oklch(0.98 0.01 25)' }}
            >
              <YouTubeIcon />
              <span className="icon-btn-label">Watch on YouTube</span>
            </a>
          </HeroPanel>

          <HeroPanel
            eyebrow="04 — Talk to us"
            eyebrowColor="oklch(0.7 0.13 145)"
            title="Get in Touch"
            body="Tell us what you need machined — we'll quote it and walk you through the file."
            opacity={v.section4Opacity}
            y={v.section4Y}
            pointerEvents={v.section4Pointer}
          >
            <a
              href="https://wa.me/15551234567"
              className="icon-btn pointer-events-auto text-[15px] font-bold"
              style={{ background: 'var(--color-green)', color: 'oklch(0.98 0.01 145)' }}
            >
              <WhatsAppIcon />
              <span className="icon-btn-label">Message us on WhatsApp</span>
            </a>
          </HeroPanel>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function HeroPanel({
  eyebrow,
  eyebrowColor,
  title,
  body,
  opacity,
  y,
  pointerEvents,
  children,
}: {
  eyebrow: string
  eyebrowColor: string
  title: string
  body: string
  opacity: number
  y: number
  pointerEvents: 'auto' | 'none'
  children: React.ReactNode
}) {
  return (
    <div
      className="absolute top-0 right-0 flex h-full w-[38%] items-center px-16"
      style={{ opacity, transform: `translateY(${y}vh)`, transition: 'opacity 0.4s linear, transform 0.4s linear', pointerEvents }}
    >
      <div>
        <div
          className="mb-5 font-mono text-xs font-semibold tracking-[0.1em] uppercase"
          style={{ color: eyebrowColor }}
        >
          {eyebrow}
        </div>
        <h2 className="mb-5 text-5xl leading-[1.05] font-extrabold tracking-tight">{title}</h2>
        <p className="mb-7 text-[17px] leading-relaxed text-(--color-ink-dim)">{body}</p>
        {children}
      </div>
    </div>
  )
}
