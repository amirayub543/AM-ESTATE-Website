'use client'

import { useEffect, useRef } from 'react'
import { Reveal } from '@/components/site/reveal'
import { STATS } from '@/lib/site-data'
import { prefersReducedMotion } from '@/lib/ticker'

const DURATION = 2000

function Counter({ value, decimals }: { value: number; decimals: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || prefersReducedMotion()) return

    element.textContent = (0).toFixed(decimals)
    let rafId = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION)
          const eased = 1 - Math.pow(1 - t, 4)
          element.textContent = (value * eased).toFixed(decimals)
          if (t < 1) rafId = requestAnimationFrame(step)
        }
        rafId = requestAnimationFrame(step)
      },
      { threshold: 0.6 },
    )
    observer.observe(element)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafId)
    }
  }, [value, decimals])

  return <span ref={ref}>{value.toFixed(decimals)}</span>
}

export function Stats() {
  return (
    <section aria-label="Company statistics" className="px-6 py-20 md:py-28">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 110} className="flex flex-col gap-2 border-l border-border pl-5 md:pl-8">
            <dt className="order-2 text-sm font-semibold">{stat.label}</dt>
            <dd className="order-1 font-serif text-5xl text-primary md:text-7xl">
              <Counter value={stat.value} decimals={stat.decimals} />
              {stat.suffix}
            </dd>
            <dd className="order-3 text-sm leading-relaxed text-muted-foreground">{stat.detail}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  )
}
