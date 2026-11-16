'use client'

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.dataset.visible = 'true'
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return ref
}

type RevealProps = {
  as?: 'div' | 'li' | 'article' | 'figure' | 'p'
  variant?: 'up' | 'scale' | 'left' | 'right'
  delay?: number
  className?: string
  children: ReactNode
}

export function Reveal({ as = 'div', variant = 'up', delay = 0, className, children }: RevealProps) {
  const ref = useReveal<HTMLElement>()
  const Tag = as as ElementType

  return (
    <Tag ref={ref} data-reveal={variant} style={{ transitionDelay: `${delay}ms` }} className={className}>
      {children}
    </Tag>
  )
}

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = 'left', className }: SectionHeadingProps) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={cn('flex max-w-3xl flex-col gap-4', align === 'center' && 'mx-auto items-center text-center', className)}
    >
      <p className="eyebrow split-fade">{eyebrow}</p>
      <h2 className="font-serif text-4xl leading-[1.08] text-balance md:text-5xl lg:text-6xl">
        {title.split(' ').map((word, index) => (
          <span key={`${word}-${index}`}>
            <span className="split-word">
              <span style={{ '--i': index } as CSSProperties}>{word}</span>
            </span>{' '}
          </span>
        ))}
      </h2>
      {description ? (
        <p className="split-fade max-w-xl leading-relaxed text-muted-foreground text-pretty">{description}</p>
      ) : null}
    </div>
  )
}
