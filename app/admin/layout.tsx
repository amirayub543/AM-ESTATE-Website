import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import '../globals.css'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AM Estate CMS — Control Panel',
  description: 'Management & Content Administration System for AM Estate & Builders',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div
      suppressHydrationWarning
      className={`${sans.variable} min-h-screen bg-[#0f1115] text-[#e6e8ec] antialiased selection:bg-[#d9b96e] selection:text-[#1a1916]`}
    >
      {children}
    </div>
  )
}
