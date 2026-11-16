'use client'

import { ArrowUpRight, Check } from 'lucide-react'
import { useState } from 'react'
import { Reveal } from '@/components/site/reveal'
import { PLOT_SIZES, whatsappMessageUrl } from '@/lib/site-data'
import { cn } from '@/lib/utils'

type Props = {
  kind: 'house' | 'plot'
}

const PURPOSES = ['Buy', 'Sell'] as const

const chipClass = (active: boolean) =>
  cn(
    'rounded-full border px-4 py-2.5 text-sm font-semibold transition duration-500 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    active
      ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
      : 'border-border bg-card text-foreground hover:border-ring/60',
  )

export function PropertyFinder({ kind }: Props) {
  const [purpose, setPurpose] = useState<(typeof PURPOSES)[number]>('Buy')
  const [sizeIndex, setSizeIndex] = useState(2)
  const [corner, setCorner] = useState(false)
  const [facingPark, setFacingPark] = useState(false)

  const size = PLOT_SIZES[sizeIndex]
  const noun = kind === 'house' ? 'house' : 'plot'
  const tags = [corner && 'Corner', facingPark && 'Facing Park'].filter(Boolean) as string[]
  const premiumCount = tags.length
  const category = ['Standard', 'Premium', 'Prime'][premiumCount]
  const categoryNote = [
    `A regular-category ${noun} — the most affordable way into this size.`,
    `${tags[0]} ${noun}s are limited in every block, so they are priced above the standard category.`,
    `Corner and park-facing together is the rarest category, with the strongest resale demand.`,
  ][premiumCount]

  const summary = `${size.label} ${noun}${tags.length ? ` · ${tags.join(' · ')}` : ''}`
  const message = [
    `Assalam o Alaikum, I want to ${purpose.toLowerCase()} a ${noun} in Bahria Town Lahore.`,
    '',
    'My requirement:',
    `- Purpose: ${purpose}`,
    `- Property: ${kind === 'house' ? 'House' : 'Plot'}`,
    `- Size: ${size.label}`,
    `- Corner: ${corner ? 'Yes' : 'No'}`,
    `- Facing Park: ${facingPark ? 'Yes' : 'No'}`,
    `- Category: ${category}`,
    '',
    purpose === 'Buy'
      ? 'Please share the current options and rates.'
      : 'Please share the current market value and how to proceed.',
  ].join('\n')

  const toggles = [
    { label: 'Corner', hint: 'Two open sides, extra light and frontage', value: corner, set: setCorner },
    { label: 'Facing Park', hint: 'Open green view in front of the gate', value: facingPark, set: setFacingPark },
  ]

  return (
    <Reveal
      variant="scale"
      className="rounded-3xl border border-border bg-background p-6 shadow-xl shadow-foreground/5 md:p-10"
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-sm font-semibold">I want to</legend>
            <div className="flex flex-wrap gap-2">
              {PURPOSES.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={purpose === option}
                  onClick={() => setPurpose(option)}
                  className={chipClass(purpose === option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-sm font-semibold">{kind === 'house' ? 'House size' : 'Plot size'}</legend>
            <div className="flex flex-wrap gap-2">
              {PLOT_SIZES.map((option, index) => (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={sizeIndex === index}
                  onClick={() => setSizeIndex(index)}
                  className={chipClass(sizeIndex === index)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-sm font-semibold">Category</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {toggles.map((toggle) => (
                <button
                  key={toggle.label}
                  type="button"
                  aria-pressed={toggle.value}
                  onClick={() => toggle.set(!toggle.value)}
                  className={cn(
                    'flex items-start gap-3 rounded-2xl border p-4 text-left transition duration-500 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                    toggle.value ? 'border-primary bg-secondary' : 'border-border bg-card hover:border-ring/60',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-500',
                      toggle.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                    )}
                    aria-hidden="true"
                  >
                    {toggle.value ? <Check className="size-3.5" /> : null}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{toggle.label}</span>
                    <span className="text-xs leading-relaxed text-muted-foreground">{toggle.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col gap-6 rounded-3xl bg-card p-6 md:p-8" aria-live="polite">
          <div className="flex flex-col gap-2">
            <p className="eyebrow">Your requirement</p>
            <p className="font-serif text-3xl leading-tight md:text-4xl">{summary}</p>
          </div>

          <dl className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-background p-4">
              <dt className="text-xs font-medium text-muted-foreground">Size</dt>
              <dd className="mt-1 text-lg font-semibold">{size.label}</dd>
            </div>
            <div className="rounded-2xl bg-background p-4">
              <dt className="text-xs font-medium text-muted-foreground">Category</dt>
              <dd className="mt-1 text-lg font-semibold text-primary">{category}</dd>
            </div>
          </dl>

          <div className="flex gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((step) => (
              <span
                key={step}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors duration-700',
                  step <= premiumCount ? 'bg-primary' : 'bg-border',
                )}
              />
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{categoryNote}</p>

          <a
            href={whatsappMessageUrl(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-auto self-start"
          >
            {purpose === 'Buy' ? "Get today's options" : 'Get a free valuation'}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Rates change with the market, so we share the latest price on WhatsApp instead of printing an outdated one
            here.
          </p>
        </div>
      </div>
    </Reveal>
  )
}
