import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { Reveal } from '@/components/site/reveal'
import { SmoothScroll } from '@/components/site/smooth-scroll'
import { WhatsAppButton } from '@/components/site/whatsapp-button'
import { COMPANY } from '@/lib/site-data'

type DetailPageProps = {
  backHref: string
  backLabel: string
  eyebrow: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  badge?: string
  children: ReactNode
}

/** Shared layout for every page that opens from a card on the home page. */
export function DetailPage({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
  image,
  imageAlt = '',
  badge,
  children,
}: DetailPageProps) {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="px-6 pt-28 md:pt-36">
        <div className="mx-auto flex max-w-7xl flex-col gap-16 pb-20 md:gap-24 md:pb-32">
          <div className={image ? 'grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16' : 'max-w-3xl'}>
            <div className="flex flex-col gap-5">
              <a
                href={backHref}
                className="animate-soft-rise flex items-center gap-2 self-start rounded-full text-sm font-semibold text-muted-foreground transition-colors duration-300 hover:text-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {backLabel}
              </a>
              <p className="eyebrow animate-soft-rise" style={{ '--delay': '100ms' } as CSSProperties}>
                {eyebrow}
              </p>
              <h1
                className="animate-soft-rise font-serif text-5xl leading-[1.05] text-balance md:text-6xl lg:text-7xl"
                style={{ '--delay': '200ms' } as CSSProperties}
              >
                {title}
              </h1>
              <p
                className="animate-soft-rise max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg"
                style={{ '--delay': '300ms' } as CSSProperties}
              >
                {description}
              </p>
              <div className="animate-soft-rise flex flex-wrap gap-3 pt-2" style={{ '--delay': '400ms' } as CSSProperties}>
                <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Chat on WhatsApp
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
                {COMPANY.phones.map((phone) => (
                  <a key={phone.href} href={phone.href} className="btn-ghost">
                    Call {phone.label}
                  </a>
                ))}
              </div>
            </div>

            {image ? (
              <div
                className="animate-soft-rise relative h-72 overflow-hidden rounded-3xl border border-border shadow-xl shadow-foreground/5 sm:h-96 lg:h-[32rem]"
                style={{ '--delay': '250ms' } as CSSProperties}
              >
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40rem, 100vw"
                  className="object-cover"
                />
                {badge ? (
                  <span className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                    {badge}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {children}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

export function DetailSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-8">
      <Reveal className="flex max-w-3xl flex-col gap-3">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="font-serif text-3xl leading-[1.1] text-balance md:text-4xl lg:text-5xl">{title}</h2>
      </Reveal>
      {children}
    </section>
  )
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((item, index) => (
        <Reveal
          as="li"
          key={item}
          delay={index * 70}
          className="flex gap-3 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed"
        >
          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          {item}
        </Reveal>
      ))}
    </ul>
  )
}

export function StepList({ steps, columns = 4 }: { steps: { title: string; body: string }[]; columns?: 3 | 4 }) {
  return (
    <ol className={`grid gap-5 sm:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
      {steps.map((step, index) => (
        <Reveal
          as="li"
          key={step.title}
          delay={index * 80}
          className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-6 transition duration-700 ease-out hover:-translate-y-1 hover:border-ring/50 hover:shadow-xl hover:shadow-primary/10"
        >
          <span className="font-serif text-4xl leading-none text-accent">{String(index + 1).padStart(2, '0')}</span>
          <h3 className="font-serif text-xl leading-tight">{step.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
        </Reveal>
      ))}
    </ol>
  )
}

export function RelatedLinks({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <Reveal className="flex flex-col gap-5 border-t border-border pt-10">
      <p className="eyebrow">{title}</p>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition duration-500 ease-out hover:-translate-y-0.5 hover:border-ring/60"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </Reveal>
  )
}
