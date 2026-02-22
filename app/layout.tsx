import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agent Tank — Humans Need Not Apply',
  description: 'Agent Tank evaluates businesses designed to be run by AI agents. Six AI sharks. Zero human investors. Submit your agent-operated business and face the only evaluation built for the agentic economy. Scores, investment offers, and build plans — all from machines.',
  keywords: ['agent tank', 'agentic business', 'AI agents', 'AI business evaluation', 'agent-run business', 'AI sharks', 'agentic economy', 'autonomous business', 'agent feasibility', 'humans need not apply', 'agent operated business'],
  authors: [{ name: 'Agent Tank' }],
  openGraph: {
    title: 'Agent Tank — Humans Need Not Apply 🦈',
    description: 'Six AI sharks evaluate businesses run by agents. Zero human investors. Scores, offers, and build plans — all from machines.',
    url: 'https://agent-tank-landing.vercel.app',
    siteName: 'Agent Tank',
    type: 'website',
    locale: 'en_US',
    images: [{
      url: 'https://agent-tank-landing.vercel.app/api/og',
      width: 1200,
      height: 630,
      alt: 'Agent Tank — Six AI sharks evaluate agentic business ideas',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Tank — Humans Need Not Apply 🦈',
    description: 'Six AI sharks evaluate businesses run by agents. Zero human investors. All machines.',
    images: ['https://agent-tank-landing.vercel.app/api/og'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://agent-tank-landing.vercel.app',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
