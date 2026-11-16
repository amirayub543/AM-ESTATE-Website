import { ArrowUpRight, Check, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckList, DetailPage, DetailSection, RelatedLinks, StepList } from '@/components/site/detail-page'
import { PropertyFinder } from '@/components/site/property-finder'
import { Reveal } from '@/components/site/reveal'
import { COMPANY, DEAL_STEPS, PROJECTS, PROPERTY_CATEGORIES } from '@/lib/site-data'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return PROPERTY_CATEGORIES.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = PROPERTY_CATEGORIES.find((item) => item.slug === slug)
  if (!category) return {}
  return {
    title: `${category.title} — Sale & Purchase | ${COMPANY.name}`,
    description: category.summary,
  }
}

export default async function PropertyCategoryPage({ params }: Props) {
  const { slug } = await params
  const category = PROPERTY_CATEGORIES.find((item) => item.slug === slug)
  if (!category) notFound()

  const noun = category.finder === 'house' ? 'house' : 'plot'

  return (
    <DetailPage
      backHref="/#real-estate"
      backLabel="Back to Real Estate"
      eyebrow={`Real Estate · ${category.eyebrow}`}
      title={category.title}
      description={category.intro}
      image={category.image}
      imageAlt={category.imageAlt}
      badge={COMPANY.city}
    >
      {category.finder ? (
        <DetailSection eyebrow="Requirement Finder" title={`Find the right ${noun} for you`}>
          <p className="-mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            Pick the size and category you have in mind. We will reply on WhatsApp with matching options and the
            latest rates.
          </p>
          <PropertyFinder kind={category.finder} />
        </DetailSection>
      ) : null}

      {category.showProjects ? (
        <DetailSection eyebrow="Market Projects" title="High-rise projects we sell units in">
          <p className="-mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            These projects belong to their own developers. We deal in the sale and purchase of apartments, shops and
            offices in them — open any project to see its details.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {PROJECTS.map((project, index) => (
              <Reveal
                as="li"
                key={project.id}
                delay={index * 70}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-foreground/5 transition duration-700 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10"
              >
                <div className="relative h-44 overflow-hidden sm:h-52">
                  <Image
                    src={project.image}
                    alt={project.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                    {project.status}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-5 md:p-6">
                  <p className="eyebrow tracking-[0.2em]">{project.category}</p>
                  <h3 className="font-serif text-2xl leading-tight">
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
                  <p className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold text-primary">
                    View project
                    <ArrowUpRight
                      className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </DetailSection>
      ) : null}

      {[
        { title: category.optionsTitle ?? `${category.title} we deal in`, items: category.options },
        ...(category.moreOptions ? [category.moreOptions] : []),
      ].map((group) => (
        <DetailSection key={group.title} eyebrow="Options" title={group.title}>
          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {group.items.map((option, index) => (
              <Reveal
                as="li"
                key={option.label}
                delay={index * 70}
                className="flex flex-col gap-2 rounded-3xl border border-border bg-card p-6 transition duration-700 ease-out hover:-translate-y-1 hover:border-ring/50 hover:shadow-xl hover:shadow-primary/10"
              >
                <h3 className="font-serif text-2xl leading-tight">{option.label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{option.detail}</p>
                {'accommodation' in option && Array.isArray((option as { accommodation?: string[] }).accommodation) ? (
                  <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-primary">
                      Standard accommodation
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {((option as { accommodation: string[] }).accommodation).map((item) => (
                        <li key={item} className="flex gap-2 text-sm leading-snug">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Reveal>
            ))}
          </ul>
        </DetailSection>
      ))}

      <DetailSection eyebrow="Sale & Purchase" title="What we do for you">
        <CheckList items={category.services} />
      </DetailSection>

      <DetailSection eyebrow="How it works" title="A clear deal in four steps">
        <StepList steps={DEAL_STEPS} />
      </DetailSection>

      <DetailSection eyebrow="Good to know" title="Why clients choose us">
        <CheckList items={category.highlights} />
      </DetailSection>

      <RelatedLinks
        title="More in Real Estate"
        links={PROPERTY_CATEGORIES.filter((item) => item.slug !== category.slug).map((item) => ({
          label: item.title,
          href: `/real-estate/${item.slug}`,
        }))}
      />
    </DetailPage>
  )
}
