import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CheckList, DetailPage, DetailSection, RelatedLinks, StepList } from '@/components/site/detail-page'
import { BUILD_STEPS, COMPANY, SERVICES } from '@/lib/site-data'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = SERVICES.find((item) => item.slug === slug)
  if (!service) return {}
  return {
    title: `${service.title} | ${COMPANY.name}`,
    description: service.summary,
  }
}

export default async function ConstructionServicePage({ params }: Props) {
  const { slug } = await params
  const service = SERVICES.find((item) => item.slug === slug)
  if (!service) notFound()

  return (
    <DetailPage
      backHref="/#construction"
      backLabel="Back to Construction"
      eyebrow={`Construction & Builders · ${service.number}`}
      title={service.title}
      description={service.summary}
    >
      <DetailSection eyebrow="Scope of work" title="What is included">
        <CheckList items={service.details} />
      </DetailSection>

      <DetailSection eyebrow="Our process" title="How we build, stage by stage">
        <StepList steps={BUILD_STEPS} columns={3} />
      </DetailSection>

      <DetailSection eyebrow="Our promise" title="Built the way it was agreed">
        <CheckList
          items={[
            'A written scope and material specification before work starts',
            'One accountable team for design, structure and finishing',
            'Regular site updates with photos and video for overseas clients',
            'A detailed quotation prepared for your plot size and requirements',
          ]}
        />
      </DetailSection>

      <RelatedLinks
        title="Other construction services"
        links={SERVICES.filter((item) => item.slug !== service.slug).map((item) => ({
          label: item.title,
          href: `/construction/${item.slug}`,
        }))}
      />
    </DetailPage>
  )
}
