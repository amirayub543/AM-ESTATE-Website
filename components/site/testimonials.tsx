import { Quote } from 'lucide-react'
import type { CSSProperties } from 'react'
import { SectionHeading } from '@/components/site/reveal'
import { TESTIMONIALS } from '@/lib/site-data'

export function Testimonials() {
  return (
    <section aria-label="Client testimonials" className="overflow-hidden py-14 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Client Stories" title="Trusted by buyers and investors" align="center" />
      </div>

      <div className="mt-8 overflow-hidden md:mt-10 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:overflow-x-auto">
        <div
          className="animate-marquee flex w-max hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
          style={{ '--marquee-duration': '56s' } as CSSProperties}
        >
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-3 pr-3 md:gap-5 md:pr-5">
              {TESTIMONIALS.map((testimonial) => (
                <li
                  key={testimonial.name}
                  className="flex w-[10.5rem] flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-lg shadow-foreground/5 md:w-[13rem] md:gap-3 md:rounded-2xl md:p-4"
                >
                  <Quote className="size-3.5 text-accent md:size-4" aria-hidden="true" />
                  <blockquote className="flex-1 text-[0.68rem] leading-relaxed text-pretty md:text-xs">
                    {testimonial.quote}
                  </blockquote>
                  <footer className="flex flex-col border-t border-border pt-2 md:pt-2.5">
                    <cite className="font-serif text-xs not-italic md:text-sm">{testimonial.name}</cite>
                    <span className="text-[0.6rem] text-muted-foreground md:text-[0.7rem]">{testimonial.role}</span>
                  </footer>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
