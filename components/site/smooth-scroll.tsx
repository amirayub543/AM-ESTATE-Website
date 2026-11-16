'use client'

import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect } from 'react'
import { prefersReducedMotion } from '@/lib/ticker'

export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.09 })
    return () => lenis.destroy()
  }, [])

  return null
}
