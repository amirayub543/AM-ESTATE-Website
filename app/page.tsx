import { Construction } from '@/components/site/construction'
import { Footer } from '@/components/site/footer'
import { Gallery } from '@/components/site/gallery'
import { Header } from '@/components/site/header'
import { HeroScroll } from '@/components/site/hero-scroll'
import { MarqueeBand } from '@/components/site/marquee-band'
import { RealEstate } from '@/components/site/real-estate'
import { RoiCalculator } from '@/components/site/roi-calculator'
import { SmoothScroll } from '@/components/site/smooth-scroll'
import { Stats } from '@/components/site/stats'
import { Testimonials } from '@/components/site/testimonials'
import { WhatsAppButton } from '@/components/site/whatsapp-button'
import { SPACES } from '@/lib/site-data'
import { spacePhotos } from '@/lib/space-photos'

export default function Page() {
  const covers: Record<string, string> = {}
  SPACES.forEach((space) => {
    const [first] = spacePhotos(space.slug)
    if (first) covers[space.slug] = first
  })

  return (
    <>
      <SmoothScroll />
      <a
        href="#real-estate"
        className="sr-only z-[60] rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Header />
      <main>
        <HeroScroll />
        <Stats />
        <MarqueeBand />
        <RealEstate />
        <Construction />
        <Gallery covers={covers} />
        <RoiCalculator />
        <Testimonials />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
