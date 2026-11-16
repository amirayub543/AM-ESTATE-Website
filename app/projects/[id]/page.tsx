import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CheckList, DetailPage, DetailSection, RelatedLinks, StepList } from '@/components/site/detail-page'
import { Reveal } from '@/components/site/reveal'
import { COMPANY, DEAL_STEPS, PROJECTS } from '@/lib/site-data'

type Props = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ id: project.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const project = PROJECTS.find((item) => item.id === id)
  if (!project) return {}
  return {
    title: `${project.title} | ${COMPANY.name}`,
    description: `${project.tagline}. ${project.category} at ${project.location}.`,
  }
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params
  const project = PROJECTS.find((item) => item.id === id)
  if (!project) notFound()

  const specs = [
    { label: 'Type', value: project.category },
    { label: 'Location', value: project.location },
    { label: 'Scale', value: project.stories },
    { label: 'Area', value: project.area },
    { label: 'Possession', value: project.possession },
    { label: 'Status', value: project.status },
  ]

  return (
    <DetailPage
      backHref="/real-estate/high-rise"
      backLabel="Back to High-Rise"
      eyebrow={`High-Rise · ${project.category}`}
      title={project.title}
      description={`${project.tagline}. A ${project.category.toLowerCase()} project at ${project.location}. ${COMPANY.name} is not the developer of this project — we deal in the sale and purchase of its units.`}
      image={project.image}
      imageAlt={project.imageAlt}
      badge={project.status}
    >
      <DetailSection eyebrow="At a glance" title="Project details">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specs.map((spec, index) => (
            <Reveal key={spec.label} delay={index * 60} className="rounded-2xl border border-border bg-card p-5">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                {spec.label}
              </dt>
              <dd className="mt-1.5 font-serif text-xl leading-snug">{spec.value}</dd>
            </Reveal>
          ))}
        </dl>
        <Reveal className="rounded-3xl bg-foreground p-6 text-background md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Investment</p>
          <p className="mt-2 font-serif text-2xl leading-tight md:text-3xl">{project.rentalYield}</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-background/70">
            Figures are indicative and not guaranteed. Ask us for the current payment plan, available units and
            floor-wise prices.
          </p>
        </Reveal>
      </DetailSection>

      <DetailSection eyebrow="Highlights" title="What makes it stand out">
        <CheckList items={project.features} />
      </DetailSection>

      <DetailSection eyebrow="How to book" title="From enquiry to ownership">
        <StepList steps={DEAL_STEPS} />
      </DetailSection>

      <RelatedLinks
        title="Other high-rise projects we sell in"
        links={PROJECTS.filter((item) => item.id !== project.id).map((item) => ({
          label: item.title,
          href: `/projects/${item.id}`,
        }))}
      />
    </DetailPage>
  )
}
