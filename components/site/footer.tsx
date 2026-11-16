import { ArrowUpRight, Clock, Mail, MapPin, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Reveal, SectionHeading } from '@/components/site/reveal'
import { COMPANY, NAV_LINKS, PROJECTS, SOCIALS, type SocialName } from '@/lib/site-data'

/** Brand marks drawn in the same outline style as the rest of the icons. */
const SOCIAL_PATHS: Record<SocialName, ReactNode> = {
  Facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  Instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  YouTube: (
    <>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </>
  ),
  TikTok: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />,
}

function SocialIcon({ name }: { name: SocialName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      {SOCIAL_PATHS[name]}
    </svg>
  )
}

const socialClass =
  'flex size-10 items-center justify-center rounded-full bg-background/10 text-accent transition duration-500 ease-out hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground'

export function Footer() {
  const contactItems: {
    icon: typeof MapPin
    label: string
    lines: { text: string; href?: string }[]
    /** Full-width row whose text never wraps (the email address). */
    oneLine?: boolean
  }[] = [
    { icon: MapPin, label: 'Visit', lines: [{ text: COMPANY.address }] },
    { icon: Phone, label: 'Call', lines: COMPANY.phones.map((phone) => ({ text: phone.label, href: phone.href })) },
    { icon: Mail, label: 'Email', lines: [{ text: COMPANY.email, href: `mailto:${COMPANY.email}` }], oneLine: true },
    { icon: Clock, label: 'Hours', lines: COMPANY.timings.map((text) => ({ text })) },
  ]

  return (
    <footer id="contact" className="scroll-mt-24 px-3 pb-3">
      <div className="relative overflow-hidden rounded-[2rem] bg-foreground text-background">
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-5 py-12 md:gap-12 md:px-10 md:py-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col gap-6">
              <SectionHeading
                eyebrow="Start a conversation"
                title="Let us build your next landmark"
                className="[&_.eyebrow]:text-accent [&_p:not(.eyebrow)]:text-background/70"
                description="Tell us about your plot, your budget or the project you have your eye on. We will take it from there."
              />
              <Reveal className="flex flex-wrap gap-3">
                <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary bg-accent text-accent-foreground">
                  Chat on WhatsApp
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
                {COMPANY.phones.map((phone) => (
                  <a key={phone.href} href={phone.href} className="btn-ghost">
                    Call {phone.label}
                  </a>
                ))}
              </Reveal>

              <ul className="grid gap-4 sm:grid-cols-2">
                {contactItems.map((item, index) => (
                  <Reveal
                    as="li"
                    key={item.label}
                    delay={index * 90}
                    className={item.oneLine ? 'flex gap-4 sm:col-span-2' : 'flex gap-4'}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background/10 text-accent">
                      <item.icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="flex min-w-0 flex-col gap-1 text-sm leading-relaxed">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-background/60">
                        {item.label}
                      </span>
                      {item.lines.map((line) =>
                        line.href ? (
                          <a
                            key={line.text}
                            href={line.href}
                            className={
                              item.oneLine
                                ? 'whitespace-nowrap text-[min(3.5vw,0.875rem)] underline-offset-4 hover:underline sm:text-sm'
                                : 'underline-offset-4 hover:underline'
                            }
                          >
                            {line.text}
                          </a>
                        ) : (
                          <span key={line.text}>{line.text}</span>
                        ),
                      )}
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>

            <Reveal variant="scale" className="h-44 overflow-hidden rounded-2xl bg-background/10 md:h-56 md:rounded-3xl">
              <iframe
                src={COMPANY.mapEmbedUrl}
                title="Map showing AM Estate & Builders in Bahria Town Lahore"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="size-full border-0"
              />
            </Reveal>
          </div>

          <div className="grid gap-8 border-t border-background/15 pt-8 md:grid-cols-[2fr_1fr_1fr]">
            <div className="flex flex-col gap-4">
              <Image
                src="/images/am-logo.png"
                alt="AM Estate & Builders logo"
                width={1024}
                height={864}
                className="h-16 w-auto self-start md:h-20"
              />
              <p className="max-w-sm text-sm leading-relaxed text-background/70">
                {COMPANY.tagline}. Real estate and architectural construction in {COMPANY.city}.
              </p>
              <ul className="flex gap-3" aria-label="Social media">
                {SOCIALS.map((social) => (
                  <li key={social.name}>
                    {social.href ? (
                      <a href={social.href} target="_blank" rel="noopener noreferrer" className={socialClass}>
                        <SocialIcon name={social.name} />
                        <span className="sr-only">{social.name}</span>
                      </a>
                    ) : (
                      <span className={socialClass} title={social.name}>
                        <SocialIcon name={social.name} />
                        <span className="sr-only">{social.name}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <nav aria-label="Footer" className="flex flex-col gap-3 text-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-background/60">Explore</h3>
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="underline-offset-4 hover:underline">
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex flex-col gap-3 text-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-background/60">High-Rise Projects</h3>
              {PROJECTS.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`} className="underline-offset-4 hover:underline">
                  {project.title}
                </Link>
              ))}
            </div>
          </div>

          <p className="text-xs text-background/60">
            &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
        </div>

        <p
          aria-hidden="true"
          className="relative -mb-[0.22em] select-none bg-gradient-to-b from-accent to-primary bg-clip-text text-center font-serif text-[13vw] leading-none text-transparent"
        >
          AM Estate
        </p>
      </div>
    </footer>
  )
}
