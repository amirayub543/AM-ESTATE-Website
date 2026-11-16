'use client'

import { ArrowUpRight, Check, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { SectionHeading } from '@/components/site/reveal'
import { PROJECTS, type Project } from '@/lib/site-data'
import { onFrame, pinProgress } from '@/lib/ticker'

const TOTAL = String(PROJECTS.length).padStart(2, '0')

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const specs = [
    { label: 'Scale', value: project.stories },
    { label: 'Area', value: project.area },
    { label: 'Possession', value: project.possession },
  ]

  return (
    <li className="group relative flex w-[84vw] shrink-0 snap-center flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-foreground/5 transition duration-700 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 sm:w-[70vw] md:h-[min(60svh,27rem)] md:w-[46rem] md:flex-row">
      <div className="relative h-52 shrink-0 overflow-hidden md:h-auto md:w-[44%]">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes="(min-width: 768px) 20rem, 84vw"
          className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
        />
        <span className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold backdrop-blur-md">
          {project.status}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-6 md:justify-center md:p-7">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow tracking-[0.2em]">{project.category}</p>
          <span className="font-serif text-sm text-muted-foreground" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <h3 className="font-serif text-2xl leading-tight md:text-3xl">
          <Link
            href={`/projects/${project.id}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {project.title}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{project.tagline}</p>
        <p className="flex items-center gap-2 text-sm">
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
          {project.location}
        </p>

        <dl className="grid grid-cols-3 gap-3 border-y border-border py-3">
          {specs.map((spec) => (
            <div key={spec.label} className="flex flex-col gap-0.5">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                {spec.label}
              </dt>
              <dd className="text-sm font-semibold leading-snug">{spec.value}</dd>
            </div>
          ))}
        </dl>

        <ul className="flex flex-col gap-1.5 md:hidden md:[@media(min-height:780px)]:flex">
          {project.features.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm leading-snug text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-primary">{project.rentalYield}</p>
          <p className="flex shrink-0 items-center gap-1 text-sm font-semibold">
            Details
            <ArrowUpRight
              className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </p>
        </div>
      </div>
    </li>
  )
}

export function Projects() {
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
        const current = Math.min(PROJECTS.length, Math.floor(progress * PROJECTS.length) + 1)
        countRef.current.textContent = String(current).padStart(2, '0')
      }
    })
  }, [])

  return (
    <section id="projects" ref={sectionRef} className="relative scroll-mt-24 py-20 md:h-[380vh] md:py-0">
      <div className="md:sticky md:top-0 md:flex md:h-svh md:flex-col md:justify-center md:overflow-hidden md:pt-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Real Estate · Projects" title="Landmark projects, built to appreciate" />
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

        <div
          ref={viewportRef}
          className="mt-10 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:mt-8 md:snap-none md:overflow-visible"
        >
          <ul
            ref={trackRef}
            className="flex w-max gap-5 px-6 pb-6 will-change-transform md:gap-7 md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
          >
            {PROJECTS.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
