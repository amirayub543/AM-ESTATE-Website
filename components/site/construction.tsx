'use client'

import { ArrowUpRight, Check } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'
import { HouseScene } from '@/components/site/building-scene'
import { Reveal, SectionHeading } from '@/components/site/reveal'
import { SERVICES } from '@/lib/site-data'

export function Construction() {
  const trackRef = useRef<HTMLDivElement>(null)

  return (
    <section id="construction" className="scroll-mt-24 bg-card px-6 py-20 md:py-32">
      {/* The house stays pinned while the services scroll past, and is built from 0 to 100% over that distance. */}
      <div ref={trackRef} className="mx-auto flex max-w-7xl flex-col gap-10 lg:grid lg:grid-cols-2 lg:gap-16">
        <div
          data-pin
          className="z-10 max-lg:top-0 max-lg:-mx-6 max-lg:-mt-20 max-lg:border-b max-lg:border-border max-lg:bg-card max-lg:px-6 max-lg:pb-4 max-lg:pt-20 max-lg:[@media(min-height:600px)]:sticky lg:sticky lg:top-24 lg:h-[calc(100svh-7.5rem)] lg:self-start"
        >
          <div className="relative h-64 overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-background to-secondary sm:h-80 md:h-[26rem] lg:h-full">
            <HouseScene trackRef={trackRef} />
            <p className="absolute right-4 top-4 text-right text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-muted-foreground md:right-6 md:top-5 md:text-xs">
              Built as you scroll
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Construction & Builders"
            title="Your house, engineered from the ground up"
            description="We build houses. One accountable team from foundation to handover — grey structure, brickwork, services and finishing — so the home you were shown in the render is the home you are handed."
          />
          <Reveal className="-mt-4 rounded-2xl border border-border bg-background px-5 py-4 text-sm leading-relaxed">
            <span className="font-semibold text-primary">Building construction is also offered.</span> Planning a
            plaza or a multi-storey building? Talk to us — we take on building projects on request.
          </Reveal>

          <ol className="flex flex-col gap-5">
            {SERVICES.map((service) => (
              <Reveal
                as="li"
                key={service.number}
                className="group relative rounded-3xl border border-border bg-background p-6 transition duration-700 ease-out hover:-translate-y-1 hover:border-ring/50 hover:shadow-xl hover:shadow-primary/10 md:p-8"
              >
                <div className="flex items-start gap-4 md:gap-5">
                  <span className="font-serif text-3xl leading-none text-accent transition-colors duration-700 group-hover:text-primary md:text-4xl">
                    {service.number}
                  </span>
                  <div className="flex flex-col gap-3">
                    <h3 className="font-serif text-xl leading-tight md:text-2xl">
                      <Link
                        href={`/construction/${service.slug}`}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                      >
                        {service.title}
                      </Link>
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">{service.summary}</p>
                    <ul className="mt-1 flex flex-col gap-2">
                      {service.details.map((detail) => (
                        <li key={detail} className="flex gap-2.5 text-sm leading-relaxed">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-primary">
                      View details
                      <ArrowUpRight
                        className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
