'use client'

import { ArrowUpRight, Camera, Play, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Reveal, SectionHeading } from '@/components/site/reveal'
import { HOUSE_TOUR, SPACES } from '@/lib/site-data'
import { clamp01, onFrame, prefersReducedMotion, viewProgress } from '@/lib/ticker'

function VideoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      data-lenis-prevent
      aria-label="AM Estate & Builders house walkthrough video"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-auto w-[min(92vw,64rem)] overflow-visible bg-transparent p-0 backdrop:bg-foreground/70 backdrop:backdrop-blur-sm"
    >
      {open ? (
        <div className="relative overflow-hidden rounded-3xl bg-foreground shadow-2xl">
          <video
            src={HOUSE_TOUR.videoUrl || '/video/house-tour.mp4'}
            poster={HOUSE_TOUR.posterUrl || '/frames/frame_119.webp'}
            controls
            autoPlay
            playsInline
            className="aspect-video w-full"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-card/90 text-foreground backdrop-blur-md transition hover:bg-card"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close video</span>
          </button>
        </div>
      ) : null}
    </dialog>
  )
}

type GalleryProps = {
  /** Cover photo per space slug, read on the server from public/images/spaces/<slug>/. */
  covers?: Record<string, string>
}

export function Gallery({ covers = {} }: GalleryProps) {
  const [videoOpen, setVideoOpen] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const videoCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const parallaxItems = Array.from(sectionRef.current?.querySelectorAll<HTMLElement>('[data-parallax]') ?? [])

    return onFrame(() => {
      parallaxItems.forEach((item) => {
        const frame = item.parentElement
        if (!frame) return
        item.style.transform = `translate3d(0, ${(viewProgress(frame) - 0.5) * -36}px, 0) scale(1.14)`
      })

      const wrap = videoWrapRef.current
      const card = videoCardRef.current
      if (wrap && card) {
        const grow = clamp01(viewProgress(wrap) * 2.4)
        card.style.transform = `scale(${0.86 + 0.14 * grow})`
      }
    })
  }, [])

  return (
    <section id="spaces" ref={sectionRef} className="scroll-mt-24 px-6 py-20 md:py-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <SectionHeading
          eyebrow="Curated Living Spaces"
          title="Rooms designed around how you live"
          description="Interiors by our in-house fitout team — warm materials, soft light and details that make a house feel like yours."
        />

        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-6">
          {SPACES.map((space, index) => (
            <Reveal
              as="li"
              key={space.slug}
              delay={(index % 3) * 140}
              className="group relative flex flex-col gap-3 md:gap-4"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary shadow-lg shadow-foreground/5 md:rounded-3xl">
                {covers[space.slug] || space.image ? (
                  <div data-parallax className="absolute inset-0 scale-[1.14]">
                    <Image
                      src={covers[space.slug] || space.image}
                      alt={space.imageAlt}
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      unoptimized={(covers[space.slug] || space.image).endsWith('.svg')}
                      className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-background to-secondary text-muted-foreground">
                    <Camera className="size-6 text-primary" aria-hidden="true" />
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em]">Photos coming soon</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 px-1">
                <h3 className="font-serif text-base leading-tight md:text-xl">
                  <Link
                    href={`/spaces/${space.slug}`}
                    className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                  >
                    {space.title}
                  </Link>
                </h3>
                <p className="hidden text-sm leading-relaxed text-muted-foreground sm:block">{space.subtitle}</p>
                <p className="flex items-center gap-1 text-xs font-semibold text-primary md:text-sm">
                  View photos
                  <ArrowUpRight
                    className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:size-4"
                    aria-hidden="true"
                  />
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        <div ref={videoWrapRef}>
          <div
            ref={videoCardRef}
            className="group relative aspect-[16/10] origin-center overflow-hidden rounded-[2rem] bg-foreground shadow-2xl shadow-foreground/15 will-change-transform md:aspect-[21/9]"
          >
            <Image
              src={HOUSE_TOUR.posterUrl || '/frames/frame_119.webp'}
              alt={HOUSE_TOUR.subtitle || 'Completed modern house by AM Estate & Builders'}
              fill
              sizes="(min-width: 1280px) 80rem, 100vw"
              className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-foreground/10" />
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="absolute inset-0 flex items-center justify-center focus-visible:outline-none"
            >
              <span className="animate-float-soft flex size-20 items-center justify-center rounded-full bg-card text-foreground shadow-2xl ring-8 ring-card/30 transition-transform duration-500 group-hover:scale-110 group-focus-within:ring-ring">
                <Play className="ml-1 size-7 fill-current" aria-hidden="true" />
              </span>
              <span className="sr-only">{HOUSE_TOUR.title || 'Play house walkthrough video'}</span>
            </button>
          </div>
        </div>
      </div>

      <VideoDialog open={videoOpen} onClose={() => setVideoOpen(false)} />
    </section>
  )
}
