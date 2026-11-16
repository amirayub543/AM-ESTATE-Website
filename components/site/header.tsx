'use client'

import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { COMPANY, NAV_LINKS } from '@/lib/site-data'
import { onFrame, pinProgress } from '@/lib/ticker'

export function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let hidden = false
    return onFrame(() => {
      const header = headerRef.current
      if (!header) return

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${maxScroll > 0 ? window.scrollY / maxScroll : 0})`
      }

      const hero = document.getElementById('home')
      if (!hero) return
      const insideHero = hero.getBoundingClientRect().bottom > window.innerHeight * 0.5
      const shouldHide = insideHero && pinProgress(hero) > 0.04
      if (shouldHide !== hidden) {
        hidden = shouldHide
        header.dataset.hidden = String(shouldHide)
        header.inert = shouldHide
        if (shouldHide) setMenuOpen(false)
      }
    })
  }, [])

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5">
        <div ref={progressRef} className="h-full origin-left scale-x-0 bg-primary" />
      </div>

      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-40 px-4 pt-4 transition duration-700 ease-out data-[hidden=true]:-translate-y-full data-[hidden=true]:opacity-0"
      >
        <div className="mx-auto max-w-6xl rounded-3xl border border-border/70 bg-card/85 shadow-lg shadow-foreground/5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 py-2 pl-3 pr-2">
            <a href="/#home" className="flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-ring">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-foreground p-1.5">
                <Image
                  src="/images/am-logo.png"
                  alt=""
                  width={1024}
                  height={864}
                  className="h-full w-auto object-contain"
                  priority
                />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-serif text-base font-semibold">{COMPANY.name}</span>
                <span className="hidden text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground sm:block">
                  {COMPANY.slogan}
                </span>
              </span>
            </a>

            <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href={COMPANY.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary hidden px-5 py-2.5 sm:inline-flex"
              >
                Book a Visit
              </a>
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex size-11 items-center justify-center rounded-full bg-secondary text-foreground lg:hidden"
              >
                {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
                <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
              </button>
            </div>
          </div>

          <div
            id="mobile-menu"
            className="grid transition-[grid-template-rows] duration-500 ease-out lg:hidden"
            style={{ gridTemplateRows: menuOpen ? '1fr' : '0fr' }}
          >
            <nav aria-label="Mobile" className="overflow-hidden" inert={!menuOpen}>
              <ul className="flex flex-col gap-1 px-3 pb-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-2xl px-4 py-3 text-base font-medium hover:bg-secondary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  )
}
