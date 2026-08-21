import { forwardRef, useEffect } from 'react'
import '../lib/threeDStage.js'
import type { ThreeDStageElement } from '../lib/three-d-stage'

interface ThreeDStageProps {
  name: string
  background?: string
  className?: string
  /** Hide the built-in OBJ/GLB download toolbar (used for the homepage hero,
   *  where the model is decorative rather than something to export). */
  hideToolbar?: boolean
}

/** Thin React wrapper around the <three-d-stage> custom element. Pages grab
 *  the element via the forwarded ref, `await stage.ready`, build a THREE
 *  scene graph, and call `stage.setObject(group)`. */
const ThreeDStage = forwardRef<ThreeDStageElement, ThreeDStageProps>(function ThreeDStage(
  { name, background = 'transparent', className, hideToolbar },
  ref,
) {
  useEffect(() => {
    if (!hideToolbar) return
    const el = (ref as React.RefObject<ThreeDStageElement>)?.current
    if (!el) return
    el.ready.then(() => {
      const toolbar = el.shadowRoot?.querySelector<HTMLElement>('.toolbar')
      if (toolbar) toolbar.style.display = 'none'
    })
  }, [hideToolbar, ref])

  return <three-d-stage ref={ref} name={name} background={background} className={className} />
})

export default ThreeDStage
