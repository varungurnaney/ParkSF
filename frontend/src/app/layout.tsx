import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ParkSF - Fair Parking in San Francisco',
  description: 'Community-first parking with ultra-low fees. Pay just $0.05 instead of $0.35-0.39 per transaction.',
  keywords: 'parking, san francisco, SFMTA, low fees, community parking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        {children}
      </body>
    </html>
  )
}
