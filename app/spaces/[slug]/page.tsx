import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CheckList, DetailPage, DetailSection, RelatedLinks, StepList } from '@/components/site/detail-page'
import { Reveal } from '@/components/site/reveal'
import { COMPANY, SPACE_DETAILS, SPACES } from '@/lib/site-data'
import { spacePhotos } from '@/lib/space-photos'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return SPACES.map((space) => ({ slug: space.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const space = SPACES.find((item) => item.slug === slug)
  if (!space) return {}
  return {
    title: `${space.title} Designs | ${COMPANY.name}`,
    description: space.subtitle,
  }
}

export default async function SpacePage({ params }: Props) {
  const { slug } = await params
  const space = SPACES.find((item) => item.slug === slug)
  if (!space) notFound()

  const folderPhotos = spacePhotos(space.slug).map((src, index) => ({
    src,
    alt: `${space.title} photo ${index + 1}`,
  }))
  const photos = [...folderPhotos, ...space.photos]
  const cover = photos[0]?.src || space.image
  const details = SPACE_DETAILS[space.slug] ?? []

  return (
    <DetailPage
      backHref="/#spaces"
      backLabel="Back to Spaces"
      eyebrow="Curated Living Spaces"
      title={space.title}
      description={space.intro}
      image={cover || undefined}
      imageAlt={space.imageAlt}
    >
      <DetailSection eyebrow="Gallery" title={`${space.title} photos`}>
        {photos.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {photos.map((photo, index) => (
              <Reveal
                as="li"
                key={photo.src}
                delay={(index % 3) * 90}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary shadow-lg shadow-foreground/5 md:rounded-3xl"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  unoptimized={photo.src.endsWith('.svg')}
                  className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                />
              </Reveal>
            ))}
          </ul>
        ) : null}
        {photos.length < 2 ? (
          <Reveal className="rounded-3xl border border-dashed border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground md:p-8">
            More {space.title.toLowerCase()} photos from our completed houses are being added. Message us on WhatsApp
            and we will share our latest work with you directly.
          </Reveal>
        ) : null}
      </DetailSection>

      {details.length > 0 ? (
        <DetailSection eyebrow="Details" title="What goes into it">
          <StepList steps={details} columns={3} />
        </DetailSection>
      ) : null}

      <DetailSection eyebrow="What we plan" title={`How we design a ${space.title.toLowerCase()}`}>
        <CheckList items={space.points} />
      </DetailSection>

      <RelatedLinks
        title="More spaces"
        links={SPACES.filter((item) => item.slug !== space.slug).map((item) => ({
          label: item.title,
          href: `/spaces/${item.slug}`,
        }))}
      />
    </DetailPage>
  )
}
