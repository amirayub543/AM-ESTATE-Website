import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AM Estate & Builders | Build With Excellence | Bahria Town Lahore',
  description:
    'AM Estate & Builders — real estate and architectural construction in Bahria Town Lahore. Landmark developments including The Oasis Grand 15, Grand 14, Grand 11, Grand X and 18 Park Residence.',
  generator: 'AM Estate & Builders',
  icons: {
    icon: '/images/am-logo.png',
    apple: '/images/am-logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f8f6f0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} bg-background`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var origSetAttr = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, val) {
                    if (name === 'bis_skin_checked' || name === 'bis_register' || (typeof name === 'string' && name.indexOf('bis_') === 0)) return;
                    return origSetAttr.apply(this, arguments);
                  };
                  if (typeof console !== 'undefined' && console.error) {
                    var origErr = console.error;
                    console.error = function() {
                      var first = arguments[0];
                      if (typeof first === 'string' && (first.indexOf('bis_skin_checked') !== -1 || first.indexOf('bis_register') !== -1)) return;
                      return origErr.apply(console, arguments);
                    };
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
