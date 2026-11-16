import { MessageCircle } from 'lucide-react'
import { COMPANY } from '@/lib/site-data'

export function WhatsAppButton() {
  return (
    <a
      href={COMPANY.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="animate-float-soft fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition-transform duration-500 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <MessageCircle className="size-6" aria-hidden="true" />
      <span className="sr-only">Chat with AM Estate & Builders on WhatsApp</span>
    </a>
  )
}
