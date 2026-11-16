'use client'

import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, type CSSProperties } from 'react'
import { COMPANY, HERO_STAGES } from '@/lib/site-data'
import { clamp01, onFrame, pinProgress, prefersReducedMotion } from '@/lib/ticker'
import { cn } from '@/lib/utils'

const FRAME_COUNT = 120
const framePath = (index: number) => `/frames/frame_${String(index).padStart(3, '0')}.webp`

const STAGE_CONFIGS = [
  { from: -1, to: 0.16, position: 'items-center justify-center text-center' },
  { from: 0.24, to: 0.46, position: 'items-end justify-start pb-28 md:pb-28' },
  { from: 0.52, to: 0.74, position: 'items-end justify-end pb-24 md:pb-28 md:text-right' },
  { from: 0.84, to: 2, position: 'items-end justify-start pb-24 md:items-center md:pb-0 md:pt-28' },
]

const STAGES = STAGE_CONFIGS.map((cfg, idx) => ({
  ...cfg,
  eyebrow: HERO_STAGES?.[idx]?.eyebrow || (idx === 0 ? COMPANY.city : `0${idx}`),
  title: HERO_STAGES?.[idx]?.title || (idx === 0 ? COMPANY.slogan : ''),
  body: HERO_STAGES?.[idx]?.body || '',
}))

const FADE = 0.05

export function HeroScroll() {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRefs = useRef<(HTMLDivElement | null)[]>([])
  const railRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const loaderTextRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!section || !sticky || !canvas || !context) return

    const reduceMotion = prefersReducedMotion()
    // Phones use their own portrait frame set (public/frames-mobile) when it exists;
    // the desktop frames and layout are never touched by it.
    let total = FRAME_COUNT
    let pathFor = framePath
    let portraitSet = false
    let frames: (HTMLImageElement | undefined)[] = new Array(FRAME_COUNT)
    let loadedCount = 0
    let cancelled = false
    let needsDraw = true
    let currentFrame = 0
    let drawnFrame = -1
    let lastProgress = -1

    const loadFrame = (index: number) => {
      const image = new Image()
      image.decoding = 'async'
      const settled = (ok: boolean) => {
        if (cancelled) return
        if (ok) frames[index] = image
        loadedCount += 1
        needsDraw = true
        if (loaderTextRef.current) {
          loaderTextRef.current.textContent = `${Math.round((loadedCount / total) * 100)}%`
        }
        if (loadedCount === total && loaderRef.current) loaderRef.current.style.opacity = '0'
      }
      image.onload = () => settled(true)
      // A frame that fails to load must not leave the loading badge on screen forever.
      image.onerror = () => settled(false)
      image.src = pathFor(index)
    }
    const startLoading = () => {
      if (cancelled) return
      frames = new Array(total)
      for (let index = 0; index < total; index += 1) loadFrame(index)
    }
    if (window.matchMedia('(max-width: 767px)').matches) {
      fetch('/frames-mobile/manifest.json')
        .then((response) => (response.ok ? response.json() : null))
        .then((manifest: { count?: number; ext?: string } | null) => {
          const count = Number(manifest?.count)
          if (count > 0) {
            const ext = manifest?.ext === 'jpg' ? 'jpg' : 'webp'
            total = count
            portraitSet = true
            pathFor = (index) => `/frames-mobile/frame_${String(index).padStart(3, '0')}.${ext}`
          }
        })
        .catch(() => undefined)
        .finally(startLoading)
    } else {
      startLoading()
    }

    const nearestFrame = (index: number) => {
      for (let offset = 0; offset < total; offset += 1) {
        const frame = frames[index - offset] ?? frames[index + offset]
        if (frame) return frame
      }
      return undefined
    }

    const drawFrame = (image: HTMLImageElement, alpha: number) => {
      const iw = image.naturalWidth
      const ih = image.naturalHeight
      // The frame always covers the whole screen — no bars, no filler.
      // Wide screens: full width, kept to the top so the logo is never cut.
      // Tall screens (mobile): full height, centred, the sides are trimmed.
      const cover = Math.max(canvas.width / iw, canvas.height / ih)
      // Mobile frames: keep the building centred and the corner logo inside the screen —
      // at most 3% is trimmed from each side, the frame sits at the top of the screen.
      const scale = portraitSet ? Math.min(cover, (canvas.width / iw) * 1.06) : cover
      const width = iw * scale
      const height = ih * scale
      context.globalAlpha = alpha
      context.drawImage(image, (canvas.width - width) / 2, 0, width, height)
      return height
    }

    /** On tall phones the frame ends above the bottom edge: melt it into the dark caption area. */
    const fadeBottom = (bottom: number) => {
      if (!portraitSet || bottom >= canvas.height - 1) return
      const fade = canvas.height * 0.22
      const gradient = context.createLinearGradient(0, bottom - fade, 0, bottom)
      gradient.addColorStop(0, 'rgba(26, 25, 22, 0)')
      gradient.addColorStop(1, 'rgb(26, 25, 22)')
      context.globalAlpha = 1
      context.fillStyle = gradient
      context.fillRect(0, bottom - fade, canvas.width, fade)
      context.fillStyle = 'rgb(26, 25, 22)'
      context.fillRect(0, bottom - 1, canvas.width, canvas.height - bottom + 1)
    }

    const draw = (frame: number) => {
      const lower = Math.floor(frame)
      const blend = frame - lower
      const base = nearestFrame(lower)
      if (!base) return
      const bottom = drawFrame(base, 1)
      const next = nearestFrame(Math.min(total - 1, lower + 1))
      if (next && next !== base && blend > 0.01) drawFrame(next, blend)
      fadeBottom(bottom)
    }

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.round(sticky.clientWidth * ratio)
      const height = Math.round(sticky.clientHeight * ratio)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        needsDraw = true
      }
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(sticky)
    resize()

    const updateOverlays = (progress: number) => {
      STAGES.forEach((stage, index) => {
        const element = stageRefs.current[index]
        if (!element) return
        const opacity = clamp01((progress - stage.from) / FADE) * clamp01((stage.to - progress) / FADE)
        const direction = progress < (stage.from + stage.to) / 2 ? 1 : -1
        element.style.opacity = String(opacity)
        element.style.visibility = opacity > 0.01 ? 'visible' : 'hidden'
        element.style.transform = `translate3d(0, ${(1 - opacity) * 28 * direction}px, 0)`
      })

      if (railRef.current) railRef.current.style.transform = `scaleY(${progress})`
      if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp01(progress / 0.05))

      const settle = clamp01((progress - 0.93) / 0.07)
      sticky.style.clipPath = settle > 0 ? `inset(${settle * 14}px round ${settle * 36}px)` : ''
    }

    const stopFrame = onFrame(() => {
      const progress = pinProgress(section)
      const targetFrame = progress * (total - 1)
      currentFrame = reduceMotion ? targetFrame : currentFrame + (targetFrame - currentFrame) * 0.14
      if (Math.abs(targetFrame - currentFrame) < 0.002) currentFrame = targetFrame

      if (needsDraw || Math.abs(currentFrame - drawnFrame) > 0.002) {
        draw(currentFrame)
        drawnFrame = currentFrame
        needsDraw = false
      }
      if (progress !== lastProgress) {
        updateOverlays(progress)
        lastProgress = progress
      }
    })

    return () => {
      cancelled = true
      stopFrame()
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <section id="home" ref={sectionRef} aria-label="Introduction" className="relative h-[420vh] bg-background">
      <div ref={stickyRef} className="sticky top-0 h-svh overflow-hidden bg-foreground text-background">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-foreground/45 via-foreground/5 to-foreground/60 max-md:from-foreground/55 max-md:via-foreground/20 max-md:to-foreground/85"
        />

        {STAGES.map((stage, index) => {
          const isIntro = index === 0
          const isFinal = index === STAGES.length - 1
          const Heading = isIntro ? 'h1' : 'h2'
          return (
            <div
              key={stage.title}
              ref={(element) => {
                stageRefs.current[index] = element
              }}
              style={isIntro ? undefined : { opacity: 0, visibility: 'hidden' }}
              className={cn('absolute inset-0 flex px-6 md:px-16', stage.position)}
            >
              <div
                className={cn(
                  'flex flex-col gap-4 [text-shadow:0_2px_28px_rgb(0_0_0/0.5)]',
                  isIntro ? 'max-w-4xl items-center' : 'max-w-md',
                  index === 2 && 'md:items-end',
                )}
              >
                <p
                  className={cn(
                    'text-xs font-semibold uppercase tracking-[0.32em] text-accent',
                    isIntro && 'animate-soft-rise',
                  )}
                >
                  {stage.eyebrow}
                </p>
                <Heading
                  className={cn(
                    'font-serif leading-[1.04] text-balance',
                    isIntro ? 'animate-soft-rise text-5xl sm:text-7xl lg:text-8xl' : 'text-4xl md:text-5xl',
                  )}
                  style={isIntro ? ({ '--delay': '150ms' } as CSSProperties) : undefined}
                >
                  {stage.title}
                </Heading>
                <p
                  className={cn(
                    'leading-relaxed text-background/90 text-pretty',
                    isIntro ? 'animate-soft-rise max-w-xl text-base md:text-lg' : 'text-sm md:text-base',
                  )}
                  style={isIntro ? ({ '--delay': '300ms' } as CSSProperties) : undefined}
                >
                  {stage.body}
                </p>
                {isFinal ? (
                  <div className="mt-2 flex flex-wrap gap-3 [text-shadow:none]">
                    <a href="#real-estate" className="btn-primary">
                      Explore Properties
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </a>
                    <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                      WhatsApp Us
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}

        <div
          ref={hintRef}
          aria-hidden="true"
          className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-background/80"
        >
          Scroll to build
          <span className="block h-10 w-px overflow-hidden bg-background/25">
            <span className="animate-scroll-hint block size-full bg-accent" />
          </span>
        </div>


        <div
          ref={loaderRef}
          role="status"
          className="absolute bottom-6 right-6 rounded-full bg-foreground/50 px-3 py-1.5 text-[0.65rem] font-medium tracking-wider text-background/90 transition-opacity duration-700"
        >
          <span className="sr-only">Loading animation frames </span>
          <span ref={loaderTextRef}>0%</span>
        </div>
      </div>
    </section>
  )
}
