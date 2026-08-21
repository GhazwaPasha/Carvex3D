import { useEffect, useState } from 'react'

const INTRO_FRAC = 80 / 930

export interface HeroScrollValues {
  introOffsetVw: number
  introOpacity: number
  gearP: number
  section1Opacity: number
  section2Opacity: number
  section3Opacity: number
  section4Opacity: number
  section1Y: number
  section2Y: number
  section3Y: number
  section4Y: number
  section2Pointer: 'auto' | 'none'
  section3Pointer: 'auto' | 'none'
  section4Pointer: 'auto' | 'none'
}

/** Drives the homepage's scroll-through-a-tall-container hero: tracks how
 *  far the user has scrolled through the hero's height and derives the
 *  intro-quote fade, the 3D model's spin/solidify progress (gearP), and the
 *  four feature-panel crossfades from it. Ported 1:1 from the original
 *  Marketplace Home.dc.html Component class. */
export function useHeroScroll(heroRef: React.RefObject<HTMLDivElement | null>): HeroScrollValues {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el = heroRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const p = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0
      setProgress(p)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [heroRef])

  const p = progress
  const introP = Math.max(0, Math.min(1, p / INTRO_FRAC))
  const gearP = p <= INTRO_FRAC ? 0 : (p - INTRO_FRAC) / (1 - INTRO_FRAC)
  const introOffsetVw = 21 * (1 - introP)
  const introOpacity = introP > 0.8 ? Math.max(0, (1 - introP) / 0.2) : 1

  // Fade-out duration for each panel, in gearP units. Kept smaller than the
  // 0.3 spacing between section centers below so consecutive panels get a
  // real gap of empty scroll between one fading out and the next appearing,
  // instead of overlapping mid-transition.
  const width = 0.1
  const fadeAbove = (center: number) => {
    if (p <= INTRO_FRAC) return 0
    if (gearP <= center) return gearP >= center - width ? 1 : 0
    return Math.max(0, 1 - (gearP - center) / width)
  }
  const centers = [0.05, 0.35, 0.65, 0.95]
  const [s1, s2, s3, s4] = centers.map(fadeAbove)

  return {
    introOffsetVw,
    introOpacity,
    gearP,
    section1Opacity: s1,
    section2Opacity: s2,
    section3Opacity: s3,
    section4Opacity: s4,
    section1Y: (centers[0] - gearP) * 140,
    section2Y: (centers[1] - gearP) * 140,
    section3Y: (centers[2] - gearP) * 140,
    section4Y: (centers[3] - gearP) * 140,
    section2Pointer: s2 > 0.5 ? 'auto' : 'none',
    section3Pointer: s3 > 0.5 ? 'auto' : 'none',
    section4Pointer: s4 > 0.5 ? 'auto' : 'none',
  }
}
