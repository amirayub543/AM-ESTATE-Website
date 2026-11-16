'use client'

import { ArrowUpRight, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { SectionHeading } from '@/components/site/reveal'
import { PROPERTY_CATEGORIES, type PropertyCategory } from '@/lib/site-data'
import { onFrame, pinProgress } from '@/lib/ticker'

const TOTAL = String(PROPERTY_CATEGORIES.length).padStart(2, '0')

function CategoryCard({ category, index }: { category: PropertyCategory; index: number }) {
  const sizes = [...category.options, ...(category.moreOptions?.items ?? [])].slice(0, 6)

  return (
    <li className="group relative flex w-[84vw] shrink-0 snap-center flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-foreground/5 transition duration-700 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 sm:w-[70vw] md:h-[min(60svh,27rem)] md:w-[46rem] md:flex-row">
      <div className="relative h-44 shrink-0 overflow-hidden sm:h-52 md:h-auto md:w-[44%]">
        <Image
          src={category.image}
          alt={category.imageAlt}
          fill
          sizes="(min-width: 768px) 20rem, 84vw"
          className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
        />
        <span className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold backdrop-blur-md">
          Sale &amp; Purchase
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 md:justify-center md:p-7">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow tracking-[0.2em]">{category.eyebrow}</p>
          <span className="font-serif text-sm text-muted-foreground" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <h3 className="font-serif text-2xl leading-tight md:text-3xl">
          <Link
            href={`/real-estate/${category.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {category.title}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{category.summary}</p>

        <ul className="flex flex-wrap gap-2 border-y border-border py-3">
          {sizes.map((option) => (
            <li key={option.label} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
              {option.label}
            </li>
          ))}
        </ul>

        <ul className="hidden flex-col gap-1.5 md:[@media(min-height:780px)]:flex">
          {category.highlights.slice(0, 2).map((highlight) => (
            <li key={highlight} className="flex gap-2 text-sm leading-snug text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {highlight}
            </li>
          ))}
        </ul>

        <p className="flex items-center gap-1 text-sm font-semibold text-primary">
          View details
          <ArrowUpRight
            className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </p>
      </div>
    </li>
  )
}

export function RealEstate() {
  const sectionRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)')
    let lastOffset = -1

    return onFrame(() => {
      const section = sectionRef.current
      const viewport = viewportRef.current
      const track = trackRef.current
      if (!section || !viewport || !track) return

      // Mobile: the cards are swiped sideways with the finger, no pinning.
      if (!desktop.matches) {
        if (lastOffset !== -1) {
          track.style.transform = ''
          lastOffset = -1
        }
        return
      }

      const progress = pinProgress(section)
      const offset = progress * Math.max(0, track.scrollWidth - viewport.clientWidth)
      if (Math.abs(offset - lastOffset) < 0.1) return
      lastOffset = offset
      track.style.transform = `translate3d(${-offset}px, 0, 0)`
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`
      if (countRef.current) {
        const count = PROPERTY_CATEGORIES.length
        countRef.current.textContent = String(Math.min(count, Math.floor(progress * count) + 1)).padStart(2, '0')
      }
    })
  }, [])

  return (
    <section id="real-estate" ref={sectionRef} className="relative scroll-mt-24 py-16 md:h-[280vh] md:py-0">
      <div className="md:sticky md:top-0 md:flex md:h-svh md:flex-col md:justify-center md:overflow-hidden md:pt-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Real Estate" title="Buy and sell property with confidence" />
          <div className="hidden shrink-0 items-center gap-4 pb-2 md:flex" aria-hidden="true">
            <span className="font-serif text-lg">
              <span ref={countRef}>01</span>
              <span className="text-muted-foreground"> / {TOTAL}</span>
            </span>
            <span className="block h-px w-32 bg-border">
              <span ref={barRef} className="block size-full origin-left scale-x-0 bg-primary" />
            </span>
          </div>
        </div>

        <p className="mt-4 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground md:hidden">
          Swipe to see more &rarr;
        </p>

        <div
          ref={viewportRef}
          className="mt-5 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:mt-8 md:snap-none md:overflow-visible"
        >
          <ul
            ref={trackRef}
            className="flex w-max gap-4 px-6 pb-6 will-change-transform md:gap-7 md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
          >
            {PROPERTY_CATEGORIES.map((category, index) => (
              <CategoryCard key={category.slug} category={category} index={index} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
