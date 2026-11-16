type FrameCallback = (time: number) => void

const callbacks = new Set<FrameCallback>()
let rafId = 0

function loop(time: number) {
  callbacks.forEach((callback) => callback(time))
  rafId = requestAnimationFrame(loop)
}

export function onFrame(callback: FrameCallback) {
  callbacks.add(callback)
  if (callbacks.size === 1) rafId = requestAnimationFrame(loop)
  return () => {
    callbacks.delete(callback)
    if (callbacks.size === 0) cancelAnimationFrame(rafId)
  }
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/** 0 → 1 while a tall section with a sticky child is pinned. */
export function pinProgress(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const distance = rect.height - window.innerHeight
  return distance <= 0 ? 0 : clamp01(-rect.top / distance)
}

/** 0 when the element enters the viewport from below, 1 when it has left at the top. */
export function viewProgress(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return clamp01((window.innerHeight - rect.top) / (window.innerHeight + rect.height))
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
