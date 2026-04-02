import type { Metadata } from 'next'
import './globals.css'
import './layout.css'
import './pages.css'
import './components.css'

export const metadata: Metadata = {
  title: 'OfferLoom',
  description: 'Next-generation offer management platform',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <div className="layout">
          {children}
        </div>
      </body>
    </html>
  )
}
