import type { CSSProperties } from 'react'
import { MARQUEE_WORDS } from '@/lib/site-data'

export function MarqueeBand() {
  return (
    <div aria-hidden="true" className="overflow-hidden border-y border-border bg-card py-2.5 md:py-3">
      <div className="animate-marquee flex w-max" style={{ '--marquee-duration': '48s' } as CSSProperties}>
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {MARQUEE_WORDS.map((word) => (
              <li key={word} className="flex items-center font-serif text-base italic text-foreground/80 md:text-xl">
                <span className="px-5 md:px-6">{word}</span>
                <span className="size-1.5 rotate-45 bg-accent" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
