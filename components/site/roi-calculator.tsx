'use client'

import { useState } from 'react'
import { Reveal, SectionHeading } from '@/components/site/reveal'

const MONTHLY_YIELD = 0.005
const ANNUAL_APPRECIATION = 0.15

const formatRupees = (amount: number) => `Rs ${Math.round(amount).toLocaleString('en-US')}`
const formatShort = (amount: number) =>
  amount >= 1e7 ? `${(amount / 1e7).toFixed(2)} Cr` : `${(amount / 1e5).toFixed(1)} Lac`

export function RoiCalculator() {
  const [investment, setInvestment] = useState(15_000_000)
  const [years, setYears] = useState(3)

  const monthlyRental = investment * MONTHLY_YIELD
  const totalRental = monthlyRental * 12 * years
  const futureValue = investment * Math.pow(1 + ANNUAL_APPRECIATION, years)
  const appreciation = futureValue - investment
  const projectedTotal = futureValue + totalRental

  const breakdown = [
    { label: 'Your investment', value: investment, className: 'bg-foreground' },
    { label: 'Capital appreciation', value: appreciation, className: 'bg-primary' },
    { label: 'Rental income', value: totalRental, className: 'bg-accent' },
  ]

  return (
    <section id="invest" className="scroll-mt-24 bg-card px-6 py-20 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[5fr_6fr] lg:items-center lg:gap-16">
        <SectionHeading
          eyebrow="Investment Calculator"
          title="See what your investment could become"
          description="Adjust the amount and holding period to estimate rental income and capital growth on a Bahria Town property."
        />

        <Reveal variant="scale" className="rounded-3xl border border-border bg-background p-6 shadow-xl shadow-foreground/5 md:p-10">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="roi-investment" className="text-sm font-semibold">
                  Investment amount
                </label>
                <output htmlFor="roi-investment" className="font-serif text-2xl text-primary">
                  Rs {formatShort(investment)}
                </output>
              </div>
              <input
                id="roi-investment"
                type="range"
                min={5_000_000}
                max={50_000_000}
                step={500_000}
                value={investment}
                onChange={(event) => setInvestment(Number(event.target.value))}
                className="h-2 w-full cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="roi-years" className="text-sm font-semibold">
                  Holding period
                </label>
                <output htmlFor="roi-years" className="font-serif text-2xl text-primary">
                  {years} {years === 1 ? 'year' : 'years'}
                </output>
              </div>
              <input
                id="roi-years"
                type="range"
                min={1}
                max={5}
                step={1}
                value={years}
                onChange={(event) => setYears(Number(event.target.value))}
                className="h-2 w-full cursor-pointer"
              />
            </div>

            <dl className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-card p-4">
                <dt className="text-xs font-medium text-muted-foreground">Monthly rental</dt>
                <dd className="mt-1 text-lg font-semibold">{formatRupees(monthlyRental)}</dd>
              </div>
              <div className="rounded-2xl bg-card p-4">
                <dt className="text-xs font-medium text-muted-foreground">Property value after {years}y</dt>
                <dd className="mt-1 text-lg font-semibold">{formatRupees(futureValue)}</dd>
              </div>
            </dl>

            <div className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm font-semibold">Projected total</p>
                <p className="font-serif text-3xl md:text-4xl" aria-live="polite">
                  Rs {formatShort(projectedTotal)}
                </p>
              </div>
              <div className="flex h-3 gap-1 overflow-hidden rounded-full" aria-hidden="true">
                {breakdown.map((part) => (
                  <span
                    key={part.label}
                    className={`rounded-full transition-[flex-grow] duration-700 ease-out ${part.className}`}
                    style={{ flexGrow: part.value, flexBasis: 0 }}
                  />
                ))}
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                {breakdown.map((part) => (
                  <li key={part.label} className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${part.className}`} aria-hidden="true" />
                    {part.label}: Rs {formatShort(part.value)}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Illustrative estimate only, assuming a 0.5% monthly rental yield and 15% annual appreciation. Actual
              returns vary and are not guaranteed.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
